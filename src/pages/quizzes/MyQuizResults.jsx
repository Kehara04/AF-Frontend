import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import Toast from "../../components/Toast";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import bgImage from "../../assets/hero.jpg";

export default function MyQuizResults() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");

  const loadResults = async () => {
    setMsg(null);
    try {
      setLoading(true);
      const res = await http.get("/quizzes/my-results");
      setResults(Array.isArray(res?.data?.results) ? res.data.results : []);
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Failed to load results",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const stats = useMemo(() => {
    const total = results.length;

    if (!total) {
      return {
        totalAttempts: 0,
        averagePercentage: 0,
        bestPercentage: 0,
        latestAttempt: "-",
      };
    }

    const averagePercentage = Math.round(
      results.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / total
    );

    const bestPercentage = Math.max(
      ...results.map((r) => Number(r.percentage || 0))
    );

    const latestAttempt = results[0]?.createdAt
      ? new Date(results[0].createdAt).toLocaleDateString()
      : "-";

    return {
      totalAttempts: total,
      averagePercentage,
      bestPercentage,
      latestAttempt,
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();

    return results.filter((r) => {
      const matchesSearch =
        !term ||
        String(r.experiment_id ?? "").toLowerCase().includes(term) ||
        String(r.quiz_id ?? "").toLowerCase().includes(term) ||
        String(r.attemptNumber ?? "").toLowerCase().includes(term);

      const percentage = Number(r.percentage || 0);

      let matchesScore = true;
      if (scoreFilter === "high") matchesScore = percentage >= 80;
      if (scoreFilter === "medium")
        matchesScore = percentage >= 50 && percentage < 80;
      if (scoreFilter === "low") matchesScore = percentage < 50;

      return matchesSearch && matchesScore;
    });
  }, [results, search, scoreFilter]);

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
                  My Quiz History 📜
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Review all your quiz attempts, scores, and performance trends.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadResults}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
                >
                  Refresh
                </button>

                <Link
                  to="/kid/quizzes"
                  className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                >
                  Start Quiz ➕
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Attempts" value={stats.totalAttempts} />
            <StatCard label="Average Score" value={`${stats.averagePercentage}%`} />
            <StatCard label="Best Score" value={`${stats.bestPercentage}%`} />
            <StatCard label="Latest Attempt" value={stats.latestAttempt} />
          </div>

          <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Attempt Records
                </h3>
                <p className="text-slate-600 mt-1">
                  Search your attempts and filter them by score range.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Search by experiment, quiz or attempt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-[320px] px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />

                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="all">All Scores</option>
                  <option value="high">80% and above</option>
                  <option value="medium">50% - 79%</option>
                  <option value="low">Below 50%</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="mt-8">
                <Loader label="Loading results..." />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="text-xl font-black text-slate-900">
                  No quiz attempts found
                </div>
                <div className="text-slate-600 mt-2">
                  {results.length === 0
                    ? "You have not attempted any quizzes yet. Start one now."
                    : "No results matched your current search or filter."}
                </div>

                {results.length === 0 && (
                  <div className="mt-5">
                    <Link
                      to="/kid/quizzes"
                      className="inline-flex px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                    >
                      Take Your First Quiz
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {filteredResults.map((r) => (
                  <ResultCard key={r._id} result={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  const percentage = Number(result.percentage || 0);

  let badgeClass = "bg-rose-100 text-rose-700";
  let badgeLabel = "Needs Improvement";

  if (percentage >= 80) {
    badgeClass = "bg-emerald-100 text-emerald-700";
    badgeLabel = "Excellent";
  } else if (percentage >= 50) {
    badgeClass = "bg-amber-100 text-amber-700";
    badgeLabel = "Good";
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/95 p-5 md:p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xl font-black text-slate-900">
              Quiz #{result.quiz_id}
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700">
              Experiment {result.experiment_id}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${badgeClass}`}>
              {badgeLabel}
            </span>
          </div>

          <div className="mt-2 text-sm text-slate-600">
            Attempt #{result.attemptNumber} •{" "}
            {result.createdAt
              ? new Date(result.createdAt).toLocaleString()
              : "-"}
          </div>
        </div>

        <div className="text-left lg:text-right">
          <div className="text-sm font-bold text-slate-500">Score</div>
          <div className="text-2xl font-black text-sky-700">
            {result.correctCount}/{result.totalQuestions}
          </div>
          <div className="text-sm font-extrabold text-slate-700">
            {percentage}%
          </div>
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <InfoPill label="Quiz ID" value={result.quiz_id} />
        <InfoPill label="Experiment ID" value={result.experiment_id} />
        <InfoPill label="Attempt Number" value={result.attemptNumber} />
        <InfoPill
          label="Correct Answers"
          value={`${result.correctCount}/${result.totalQuestions}`}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-bold text-slate-600 mb-2">
          <span>Performance</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              percentage >= 80
                ? "bg-emerald-500"
                : percentage >= 50
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
            style={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-lg rounded-[28px] p-5">
      <div className="text-sm font-bold text-slate-600">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
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