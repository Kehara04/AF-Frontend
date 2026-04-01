import { useState } from "react";
import http from "../../api/http";
import Toast from "../../components/Toast";
import Loader from "../../components/Loader";
import bgImage from "../../assets/hero.jpg";

export default function AdminQuizResults() {
  const [experimentId, setExperimentId] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const load = async (e) => {
    e.preventDefault();
    setMsg(null);

    const id = Number(experimentId);
    if (!Number.isInteger(id) || id <= 0) {
      return setMsg({
        type: "error",
        text: "Enter a valid experiment_id number",
      });
    }

    try {
      setLoading(true);
      const res = await http.get(`/quizzes/experiment/${id}/results`);
      setResults(res.data.results || []);
    } catch (e2) {
      setMsg({
        type: "error",
        text: e2?.response?.data?.message || "Failed to load results",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-[32px] p-6 md:p-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Admin Quiz Results 📊
            </h2>
            <p className="text-slate-600 font-medium mt-2">
              View all quiz attempts by experiment ID in one place.
            </p>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>

            <form
              onSubmit={load}
              className="mt-6 flex flex-col lg:flex-row gap-3"
            >
              <input
                className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 bg-white/95 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={experimentId}
                onChange={(e) => setExperimentId(e.target.value)}
                placeholder="Enter Experiment ID (e.g., 1)"
              />
              <button className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black transition">
                Load Results
              </button>
            </form>
          </div>

          <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] overflow-hidden">
            {loading ? (
              <div className="p-10">
                <Loader label="Loading results..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100/90">
                    <tr className="text-left text-slate-700 uppercase text-xs tracking-wide">
                      <th className="px-6 py-4">Kid ID</th>
                      <th className="px-6 py-4">Quiz ID</th>
                      <th className="px-6 py-4">Attempt</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Percentage</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr
                        key={r._id}
                        className="border-t border-slate-100 hover:bg-slate-50/80 transition"
                      >
                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          {r.kid_id}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{r.quiz_id}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 font-bold">
                            #{r.attemptNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">
                          {r.correctCount}/{r.totalQuestions}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 font-extrabold">
                            {r.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {results.length === 0 && (
                      <tr>
                        <td
                          className="px-6 py-10 text-center text-slate-500 font-medium"
                          colSpan="6"
                        >
                          No results found for this experiment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}