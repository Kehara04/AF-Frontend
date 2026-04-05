import { useEffect, useState } from "react";
import http from "../../api/http";

const BADGE_META = {
    "Beginner Scientist": { icon: "🔬", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", rank: 1 },
    "Junior Explorer": { icon: "🗺️", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", rank: 2 },
    "Senior Innovator": { icon: "🚀", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", rank: 3 },
    "Master Scientist": { icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", rank: 4 },
};

const BADGE_THRESHOLDS = [
    { badge: "Beginner Scientist", icon: "🔬", min: 0, max: 9, color: "bg-slate-200" },
    { badge: "Junior Explorer", icon: "🗺️", min: 10, max: 19, color: "bg-amber-300" },
    { badge: "Senior Innovator", icon: "🚀", min: 20, max: 29, color: "bg-violet-400" },
    { badge: "Master Scientist", icon: "🏆", min: 30, max: null, color: "bg-yellow-400" },
];

function BadgePill({ badge }) {
    const meta = BADGE_META[badge] || BADGE_META["Beginner Scientist"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${meta.bg} ${meta.color} ${meta.border}`}>
            {meta.icon} {badge}
        </span>
    );
}

function RankIcon({ rank }) {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-base font-black text-slate-400">#{rank}</span>;
}

export default function AdminProgressManagement() {
    const [allProgress, setAllProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filterBadge, setFilterBadge] = useState("all");
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await http.get("/progress/admin/all");
                setAllProgress(res.data.progress || []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load progress.");
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const filtered = allProgress.filter(p => {
        const matchBadge = filterBadge === "all" || p.badge === filterBadge;
        const name = p.student?.name?.toLowerCase() || "";
        const email = p.student?.email?.toLowerCase() || "";
        const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
        return matchBadge && matchSearch;
    });

    // Stats
    const badgeCounts = {};
    allProgress.forEach(p => {
        badgeCounts[p.badge] = (badgeCounts[p.badge] || 0) + 1;
    });
    const totalKids = allProgress.length;
    const avgCompleted = totalKids
        ? (allProgress.reduce((s, p) => s + p.totalCompleted, 0) / totalKids).toFixed(1)
        : 0;
    const topKid = allProgress[0]; // Already sorted by backend

    if (loading) return (
        <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Loading progress data...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-20 text-rose-600 font-bold">{error}</div>
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="bg-white/70 backdrop-blur-md border border-white/70 shadow-xl rounded-3xl p-5">
                <h1 className="text-3xl font-black text-slate-900">Progress Management 📊</h1>
                <p className="text-slate-500 text-sm mt-0.5">Track all kids' experiment progress and badges</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-violet-100/75 backdrop-blur-sm border border-violet-200 rounded-2xl p-4 text-violet-700">
                    <div className="text-2xl mb-1">👧</div>
                    <div className="text-2xl font-black">{totalKids}</div>
                    <div className="text-xs font-semibold opacity-80">Total Kids</div>
                </div>
                <div className="bg-emerald-100/75 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 text-emerald-700">
                    <div className="text-2xl mb-1">🧪</div>
                    <div className="text-2xl font-black">{avgCompleted}</div>
                    <div className="text-xs font-semibold opacity-80">Avg Completed</div>
                </div>
                <div className="bg-yellow-100/75 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4 text-yellow-700">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-2xl font-black">{badgeCounts["Master Scientist"] || 0}</div>
                    <div className="text-xs font-semibold opacity-80">Master Scientists</div>
                </div>
                <div className="bg-amber-100/75 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 text-amber-700">
                    <div className="text-2xl mb-1">🗺️</div>
                    <div className="text-2xl font-black">{badgeCounts["Junior Explorer"] || 0}</div>
                    <div className="text-xs font-semibold opacity-80">Junior Explorers</div>
                </div>
            </div>

            {/* Badge Distribution */}
            <div className="bg-white/75 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-slate-800 mb-4">Badge Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BADGE_THRESHOLDS.map(b => {
                        const count = badgeCounts[b.badge] || 0;
                        const pct = totalKids > 0 ? Math.round((count / totalKids) * 100) : 0;
                        const meta = BADGE_META[b.badge];
                        return (
                            <div key={b.badge} className={`border rounded-2xl p-4 ${meta.bg} ${meta.border}`}>
                                <div className="text-3xl mb-1">{b.icon}</div>
                                <div className={`font-black text-2xl ${meta.color}`}>{count}</div>
                                <div className={`text-xs font-bold ${meta.color} opacity-80`}>{b.badge}</div>
                                <div className="mt-2 h-1.5 rounded-full bg-white/70 overflow-hidden">
                                    <div className={`h-full rounded-full ${b.color} transition-all`} style={{ width: `${pct}%` }} />
                                </div>
                                <div className={`text-xs mt-1 ${meta.color} opacity-60`}>{pct}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Kid highlight */}
            {topKid && topKid.totalCompleted > 0 && (
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-6 text-white flex items-center gap-4 shadow-xl shadow-violet-200">
                    <span className="text-5xl">🥇</span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Top Scientist</p>
                        <p className="text-2xl font-black">{topKid.student?.name || "Unknown"}</p>
                        <p className="text-sm opacity-80">{topKid.totalCompleted} experiments completed • {BADGE_META[topKid.badge]?.icon} {topKid.badge}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white/75 backdrop-blur-sm border border-white/60 rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-center shadow-sm">
                <span className="text-sm font-bold text-slate-600">Filter:</span>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-white/70 bg-white/90 rounded-xl px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-violet-400 min-w-[200px]"
                />
                <select
                    value={filterBadge}
                    onChange={e => setFilterBadge(e.target.value)}
                    className="border border-white/70 bg-white/90 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-400"
                >
                    <option value="all">All Badges</option>
                    {BADGE_THRESHOLDS.map(b => (
                        <option key={b.badge} value={b.badge}>{b.icon} {b.badge}</option>
                    ))}
                </select>
                <span className="text-xs text-slate-400 ml-auto">{filtered.length} kid{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white/75 backdrop-blur-sm border border-white/60 rounded-3xl shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 font-medium">No kids found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/90 border-b border-white/70">
                                <tr>
                                    {["Rank", "Kid", "Badge", "Completed", "Experiments", ""].map(h => (
                                        <th key={h} className="text-left text-xs font-black text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/55">
                                {filtered.map((p, idx) => {
                                    const rank = allProgress.findIndex(ap => ap._id === p._id) + 1;
                                    const isExpanded = expandedRow === p._id;
                                    const experiments = p.completedExperiments || [];
                                    return (
                                        <>
                                            <tr key={p._id} className={`hover:bg-white/65 transition-colors ${rank <= 3 ? "bg-gradient-to-r from-transparent to-yellow-50/30" : ""}`}>
                                                <td className="px-5 py-4 text-center">
                                                    <RankIcon rank={rank} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-slate-800">{p.student?.name || "—"}</p>
                                                    <p className="text-xs text-slate-400">{p.student?.email}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <BadgePill badge={p.badge} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-2xl text-violet-600">{p.totalCompleted}</span>
                                                        <span className="text-xs text-slate-400">experiments</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {experiments.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                            {experiments.slice(0, 3).map(exp => (
                                                                <span key={exp._id || exp} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-lg font-medium">
                                                                    {exp.title || `Exp #${exp.experiment_id}`}
                                                                </span>
                                                            ))}
                                                            {experiments.length > 3 && (
                                                                <span className="text-xs text-slate-400 font-medium">+{experiments.length - 3} more</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">No experiments</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {experiments.length > 3 && (
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : p._id)}
                                                            className="text-xs font-bold text-violet-600 hover:text-violet-800 underline transition whitespace-nowrap"
                                                        >
                                                            {isExpanded ? "Collapse" : "View all"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${p._id}-expanded`} className="bg-violet-50/40">
                                                    <td colSpan={6} className="px-5 py-4">
                                                        <p className="text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">All Completed Experiments</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {experiments.map(exp => (
                                                                <span key={exp._id || exp} className="text-xs bg-white text-violet-700 border border-violet-200 px-3 py-1 rounded-xl font-medium shadow-sm">
                                                                    {exp.title || `Experiment #${exp.experiment_id}`}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
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
