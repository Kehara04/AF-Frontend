import { useEffect, useState, useRef } from "react";
import http from "../../api/http";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const TYPE_META = {
    positive: { emoji: "😄", label: "Happy", color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "knowledge-sharing": { emoji: "😐", label: "Okay", color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    negative: { emoji: "😢", label: "Sad", color: "#f43f5e", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

function StarDisplay({ rating }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= rating ? "text-amber-400" : "text-slate-200"}>★</span>
            ))}
        </span>
    );
}

export default function AdminFeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterExp, setFilterExp] = useState("all");
    const [deleting, setDeleting] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState("");

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await http.get("/feedback/admin/all");
            setFeedbacks(res.data.feedbacks || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load feedback.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    const handleDelete = async (feedbackId) => {
        if (!window.confirm("Delete this feedback?")) return;
        setDeleting(feedbackId);
        try {
            await http.delete(`/feedback/${feedbackId}`);
            setDeleteSuccess("Feedback deleted successfully.");
            setTimeout(() => setDeleteSuccess(""), 3000);
            fetchFeedbacks();
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed.");
        } finally {
            setDeleting(null);
        }
    };

    // ── Derived data ──
    const experimentNames = [...new Set(feedbacks.map(f => f.experiment?.title).filter(Boolean))];

    const filtered = feedbacks.filter(f => {
        const matchType = filterType === "all" || f.feedbackType === filterType;
        const matchExp = filterExp === "all" || f.experiment?.title === filterExp;
        return matchType && matchExp;
    });

    const typeCounts = { positive: 0, "knowledge-sharing": 0, negative: 0 };
    feedbacks.forEach(f => { if (typeCounts[f.feedbackType] !== undefined) typeCounts[f.feedbackType]++; });

    // Avg rating per experiment
    const expRatingMap = {};
    feedbacks.forEach(f => {
        const name = f.experiment?.title || "Unknown";
        if (!expRatingMap[name]) expRatingMap[name] = { sum: 0, count: 0 };
        expRatingMap[name].sum += f.rating;
        expRatingMap[name].count++;
    });
    const expNames = Object.keys(expRatingMap);
    const avgRatings = expNames.map(name => (expRatingMap[name].sum / expRatingMap[name].count).toFixed(1));

    const avgOverall = feedbacks.length
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
        : "—";

    // Chart data
    const doughnutData = {
        labels: ["Happy 😄", "Okay 😐", "Sad 😢"],
        datasets: [{
            data: [typeCounts.positive, typeCounts["knowledge-sharing"], typeCounts.negative],
            backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
            borderWidth: 2,
            borderColor: "#fff",
            hoverOffset: 6,
        }],
    };

    const barData = {
        labels: expNames,
        datasets: [{
            label: "Avg Rating",
            data: avgRatings,
            backgroundColor: "rgba(139, 92, 246, 0.8)",
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            y: { min: 0, max: 5, ticks: { stepSize: 1 }, grid: { color: "#f1f5f9" } },
            x: { grid: { display: false } },
        },
    };

    if (loading) return (
        <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading feedback...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-20 text-rose-600 font-bold">{error}</div>
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Feedback Management 💬</h1>
                    <p className="text-slate-500 text-sm mt-0.5">All experiment feedback from kids</p>
                </div>
                {deleteSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-4 py-2 rounded-xl">
                        ✅ {deleteSuccess}
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Feedback", value: feedbacks.length, icon: "💬", color: "bg-violet-50 border-violet-200 text-violet-700" },
                    { label: "Avg Rating", value: `${avgOverall} ★`, icon: "⭐", color: "bg-amber-50 border-amber-200 text-amber-700" },
                    { label: "Happy Responses", value: typeCounts.positive, icon: "😄", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                    { label: "Sad Responses", value: typeCounts.negative, icon: "😢", color: "bg-rose-50 border-rose-200 text-rose-700" },
                ].map(s => (
                    <div key={s.label} className={`border rounded-2xl p-4 ${s.color}`}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-black">{s.value}</div>
                        <div className="text-xs font-semibold opacity-80">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            {feedbacks.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4">Feedback Type Distribution</h3>
                        <div className="max-w-xs mx-auto">
                            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: "bottom" } } }} />
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4">Avg Rating per Experiment</h3>
                        {expNames.length > 0
                            ? <Bar data={barData} options={barOptions} />
                            : <p className="text-slate-400 text-sm text-center mt-8">No data yet</p>
                        }
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-center shadow-sm">
                <span className="text-sm font-bold text-slate-600">Filter:</span>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-400"
                >
                    <option value="all">All Types</option>
                    <option value="positive">😄 Happy</option>
                    <option value="knowledge-sharing">😐 Okay</option>
                    <option value="negative">😢 Sad</option>
                </select>
                <select
                    value={filterExp}
                    onChange={e => setFilterExp(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-400"
                >
                    <option value="all">All Experiments</option>
                    {experimentNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                <span className="text-xs text-slate-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 font-medium">No feedback found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {["Kid", "Experiment", "Type", "Rating", "Comment", "Date", "Action"].map(h => (
                                        <th key={h} className="text-left text-xs font-black text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(f => {
                                    const meta = TYPE_META[f.feedbackType] || TYPE_META["knowledge-sharing"];
                                    const date = new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                    return (
                                        <tr key={f._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-800">{f.student?.name || "—"}</p>
                                                <p className="text-xs text-slate-400">{f.student?.email}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-medium text-slate-700">{f.experiment?.title || "—"}</span>
                                                <p className="text-xs text-slate-400">ID: {f.experiment?.experiment_id}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                                                    {meta.emoji} {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <StarDisplay rating={f.rating} />
                                                <p className="text-xs text-slate-400 mt-0.5">{f.rating}/5</p>
                                            </td>
                                            <td className="px-5 py-4 max-w-[200px]">
                                                <p className="text-slate-600 text-xs line-clamp-2">{f.comment}</p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{date}</td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleDelete(f.feedback_id)}
                                                    disabled={deleting === f.feedback_id}
                                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition disabled:opacity-50"
                                                >
                                                    {deleting === f.feedback_id ? "..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
