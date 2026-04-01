import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import Toast from "../../components/Toast";
import Loader from "../../components/Loader";
import bgImage from "../../assets/hero.jpg";

export default function KidQuizHome() {
  const nav = useNavigate();

  const [experimentId, setExperimentId] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState([]);
  const [search, setSearch] = useState("");

  const loadExperiments = async () => {
    setMsg(null);
    try {
      setLoading(true);
      const res = await http.get("/experiments");
      setExperiments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to load experiments",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  const filteredExperiments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return experiments;

    return experiments.filter((exp) => {
      const title = (exp.title || "").toLowerCase();
      const ageGroup = (exp.ageGroup || "").toLowerCase();
      const difficulty = (exp.difficulty || "").toLowerCase();
      const experimentId = String(exp.experiment_id || "").toLowerCase();

      return (
        title.includes(term) ||
        ageGroup.includes(term) ||
        difficulty.includes(term) ||
        experimentId.includes(term)
      );
    });
  }, [experiments, search]);

  const go = (e) => {
    e.preventDefault();
    setMsg(null);

    const id = Number(experimentId);
    if (!Number.isInteger(id) || id <= 0) {
      return setMsg({
        type: "error",
        text: "Enter a valid experiment ID (positive number)",
      });
    }

    nav(`/kid/quizzes/${id}`);
  };

  const startQuiz = (id) => {
    setMsg(null);
    nav(`/kid/quizzes/${id}`);
  };

  return (
    <div
      className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  Quiz Center 📝
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Choose an experiment from the list below and start the related quiz easily.
                </p>
              </div>

              <button
                onClick={loadExperiments}
                className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
              >
                Refresh Experiments
              </button>
            </div>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>
          </div>

          <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Available Experiments
                </h3>
                <p className="text-slate-600 mt-1">
                  Find your experiment and start the quiz with one click.
                </p>
              </div>

              <div className="w-full lg:w-[360px]">
                <input
                  type="text"
                  placeholder="Search by title, ID, age group or difficulty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-8">
                <Loader label="Loading experiments..." />
              </div>
            ) : filteredExperiments.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="text-xl font-black text-slate-900">
                  No experiments found
                </div>
                <div className="text-slate-600 mt-2">
                  {experiments.length === 0
                    ? "There are no experiments available right now."
                    : "No experiments matched your search."}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredExperiments.map((exp) => {
                  const imageUrl = exp.image
                    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${exp.image}`
                    : "";

                  return (
                    <div
                      key={exp._id || exp.experiment_id}
                      className="rounded-[28px] border border-slate-200 bg-slate-50/95 shadow-sm overflow-hidden"
                    >
                      <div className="h-48 bg-slate-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={exp.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🧪
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xl font-black text-slate-900">
                              {exp.title}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              Experiment ID:{" "}
                              <span className="font-extrabold text-sky-700">
                                {exp.experiment_id}
                              </span>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700">
                            {exp.ageGroup || "All Ages"}
                          </span>
                        </div>

                        <p className="mt-3 text-slate-700 text-sm line-clamp-3">
                          {exp.description}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <InfoPill label="Difficulty" value={exp.difficulty || "-"} />
                          <InfoPill label="Duration" value={exp.duration || "-"} />
                        </div>

                        {Array.isArray(exp.tools) && exp.tools.length > 0 && (
                          <div className="mt-4">
                            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-2">
                              Tools
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {exp.tools.slice(0, 4).map((tool, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700"
                                >
                                  {tool}
                                </span>
                              ))}
                              {exp.tools.length > 4 && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                                  +{exp.tools.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => startQuiz(exp.experiment_id)}
                          className="mt-5 w-full py-3 rounded-2xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition"
                        >
                          Start Quiz 🚀
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
            <h3 className="text-2xl font-black text-slate-900">
              Manual Quiz Access
            </h3>
            <p className="text-slate-600 mt-1">
              If you already know the experiment ID, you can enter it directly here.
            </p>

            <form onSubmit={go} className="mt-6 grid md:grid-cols-[1fr_auto] gap-4">
              <label className="block">
                <div className="text-sm font-extrabold text-slate-800 mb-2">
                  Experiment ID
                </div>
                <input
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                  value={experimentId}
                  onChange={(e) => setExperimentId(e.target.value)}
                  placeholder="Example: 1"
                />
              </label>

              <div className="flex items-end">
                <button className="w-full md:w-auto px-8 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition">
                  Start by ID ➕
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 min-w-0">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-800 truncate">
        {value ?? "-"}
      </div>
    </div>
  );
}