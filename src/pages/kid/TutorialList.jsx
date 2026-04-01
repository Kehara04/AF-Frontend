import { useEffect, useState } from "react";
import http from "../../api/http";
import { Link, useParams } from "react-router-dom";

export default function TutorialList() {
    const { experimentId } = useParams();
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTutorials();
    }, [experimentId]);

    const fetchTutorials = async () => {
        try {
            // Assuming GET /tutorials returns all tutorials available, or we fetch a list.
            // If the backend requires an experiment ID to fetch tutorials, we'd need to fetch experiments first
            // and then fetch tutorials for each, or assume a general endpoint exists.
            // For now, based on the admin side, there is /tutorials/experiment/:expId
            // And a creation endpoint POST /tutorials. We'll try to fetch all tutorials if such an endpoint exists,
            // otherwise, we will fetch experiments and then their tutorials. Let's assume GET /tutorials works,
            // if not, we can fall back to fetching all experiments and aggregating their tutorials.
            // I'll implement a robust fallback here just in case.
            let allTutorials = [];
            try {
                let endpoint = "/tutorials";
                if (experimentId) {
                    endpoint = `/tutorials/experiment/${experimentId}`;
                }
                const res = await http.get(endpoint);

                // Handle different response formats
                if (res.data && res.data.data && Array.isArray(res.data.data.items)) {
                    allTutorials = res.data.data.items;
                } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    allTutorials = res.data.data;
                } else if (Array.isArray(res.data)) {
                    allTutorials = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    allTutorials = res.data.data;
                }

                // If filtering by expId returned empty, maybe show error or handle it
                if (experimentId && allTutorials.length === 0) {
                    console.log("No tutorials for this experiment");
                }

            } catch (err) {
                // Fallback: If endpoint doesn't exist or fails
                console.log("fetch error", err.message);
                if (!experimentId) {
                    // Try to aggregate if we don't have a broad /tutorials endpoint
                    const expRes = await http.get("/experiments");
                    const experiments = expRes.data;

                    for (const exp of experiments) {
                        try {
                            const tutRes = await http.get(`/tutorials/experiment/${exp.experiment_id || exp._id}`);
                            if (tutRes.data && tutRes.data.data && tutRes.data.data.items) {
                                allTutorials = [...allTutorials, ...tutRes.data.data.items];
                            }
                        } catch (e) { }
                    }
                } else {
                    throw err; // Re-throw if it's a specific experiment fetch that failed
                }
            }
            setTutorials(allTutorials);
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-3"></div>
                <p className="text-gray-500">Loading awesome tutorials...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Tutorials 🎥✨
                </h2>
                <p className="text-slate-600 font-semibold mb-6">
                    Follow step-by-step guides to build amazing things!
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
                        ⚠ {error}
                    </div>
                )}

                {tutorials.length === 0 && !error ? (
                    <div className="text-center py-12 text-slate-400">
                        <span className="text-5xl block mb-4">🤷‍♂️</span>
                        <p className="text-lg font-bold">No tutorials found right now.</p>
                        <p>Check back later!</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tutorials.map((tut) => {
                            const savedStep = (() => {
                                try { const v = localStorage.getItem(`kid_tutorial_progress_${tut._id}`); return v !== null ? parseInt(v, 10) : 0; } catch { return 0; }
                            })();
                            const stepCount = tut.steps?.length || 0;
                            const inProgress = savedStep > 0 && savedStep < stepCount;
                            return (
                                <Link
                                    key={tut._id}
                                    to={`/kid/tutorials/${tut._id}`}
                                    className="group bg-slate-50 border rounded-3xl p-5 hover:bg-white hover:shadow-md transition flex flex-col h-full relative"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-3xl">🎬</span>
                                        <div className="flex gap-1 flex-wrap justify-end">
                                            {inProgress && (
                                                <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-full">▶ Step {savedStep + 1}/{stepCount}</span>
                                            )}
                                            {tut.youtube?.videoId && (
                                                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">YouTube</span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
                                        {tut.title}
                                    </h3>
                                    {tut.expectedOutcome && (
                                        <p className="text-slate-600 text-sm font-medium line-clamp-3 mb-4 flex-grow">
                                            {tut.expectedOutcome}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-500">
                                        <span>{stepCount} {stepCount === 1 ? 'step' : 'steps'}</span>
                                        <span className="text-violet-600 group-hover:translate-x-1 transition-transform">
                                            {inProgress ? 'Continue 📍' : "Let's Go 🚀"}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
