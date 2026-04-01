import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import http from "../../api/http";
import Toast from "../../components/Toast";
import ProgressBar from "../../components/ProgressBar";
import Loader from "../../components/Loader";
import bgImage from "../../assets/hero.jpg";

export default function TakeQuiz() {
  const { experiment_id } = useParams();
  const expId = Number(experiment_id);
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);

  const total = quiz?.totalQuestions || 0;

  const answeredCount = useMemo(
    () => answers.filter((a) => typeof a === "number").length,
    [answers]
  );

  const progressPercent = useMemo(() => {
    if (!total) return 0;
    return Math.round(((current + 1) / total) * 100);
  }, [current, total]);

  const answerPercent = useMemo(() => {
    if (!total) return 0;
    return Math.round((answeredCount / total) * 100);
  }, [answeredCount, total]);

  useEffect(() => {
    (async () => {
      setMsg(null);

      if (!Number.isInteger(expId) || expId <= 0) {
        setLoading(false);
        return setMsg({ type: "error", text: "Invalid experiment_id" });
      }

      try {
        setLoading(true);
        const res = await http.get(`/quizzes/experiment/${expId}`);
        const q = res.data.quiz;
        setQuiz(q);
        setAnswers(new Array(q.totalQuestions).fill(null));
        setCurrent(0);
      } catch (e) {
        setMsg({
          type: "error",
          text: e?.response?.data?.message || "No active quiz for this experiment",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [expId]);

  const setAnswer = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const goNext = () => {
    setMsg(null);
    if (!quiz) return;
    if (current < total - 1) setCurrent((p) => p + 1);
  };

  const goBack = () => {
    setMsg(null);
    if (!quiz) return;
    if (current > 0) setCurrent((p) => p - 1);
  };

  const submit = async () => {
    setMsg(null);
    if (!quiz) return;

    setSubmitting(true);
    try {
      const res = await http.post(`/quizzes/${quiz.quiz_id}/submit`, {
        answers,
      });

      nav("/kid/quizzes/result", { state: res.data });
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message || "Submit failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-8">
              <Loader label="Loading quiz..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div
        className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-8 text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h2 className="text-3xl font-black text-slate-900">
                No Quiz Available
              </h2>

              <div className="mt-4">
                <Toast type={msg?.type} text={msg?.text} />
              </div>

              <p className="text-slate-600 mt-3 font-medium">
                No active quiz was found for this experiment right now.
              </p>

              <div className="mt-6">
                <Link
                  className="inline-flex px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                  to="/kid/quizzes"
                >
                  ← Back to Quizzes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[current];
  const selected = answers[current];

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
                  {quiz.title || "Quiz"} 🎮🧠
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Experiment ID: <b>{expId}</b> • Complete the quiz step by step and submit when ready.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/kid/quizzes/history"
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black transition"
                >
                  My History 📜
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Question" value={`${current + 1}/${total}`} />
            <StatCard label="Answered" value={`${answeredCount}/${total}`} />
            <StatCard label="Answer Progress" value={`${answerPercent}%`} />
            <StatCard label="Quiz Progress" value={`${progressPercent}%`} />
          </div>

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900">
                Quiz Progress
              </h3>
              <p className="text-slate-600 mt-1">
                Track where you are and jump to any question.
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span>
                    Current Question: <b>{current + 1}</b> of <b>{total}</b>
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={progressPercent} />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span>
                    Answered: <b>{answeredCount}</b> of <b>{total}</b>
                  </span>
                  <span>{answerPercent}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={answerPercent} />
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-extrabold text-slate-800 mb-3">
                  Question Navigator
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: total }).map((_, i) => {
                    const done = typeof answers[i] === "number";
                    const active = i === current;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrent(i)}
                        className={`w-10 h-10 rounded-full font-extrabold text-sm border transition
                          ${active ? "bg-sky-600 text-white border-sky-600" : ""}
                          ${done && !active ? "border-sky-300 bg-sky-50 text-sky-800" : ""}
                          ${!done && !active ? "border-slate-200 text-slate-500 bg-white hover:bg-slate-50" : ""}
                        `}
                        title={`Go to Question ${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-medium">
                <div className="font-black text-slate-900 mb-1">Quiz Rules</div>
                <div className="text-sm">
                  Multiple attempts are allowed. Your attempt becomes complete when you press submit.
                </div>
              </div>
            </div>

            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    Q{current + 1}. {q.questionText}
                  </div>
                  <div className="mt-2 text-slate-600 font-medium">
                    Choose the best answer from the options below.
                  </div>
                </div>

                <div className="text-xs font-extrabold bg-slate-100 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                  Pick 1 ✅
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {q.options.map((opt, i) => {
                  const active = selected === i;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswer(current, i)}
                      className={`text-left px-4 py-4 rounded-2xl border font-semibold transition
                        ${active ? "bg-sky-50 border-sky-300 text-sky-900 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}
                      `}
                    >
                      <span className="font-black mr-2">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={current === 0}
                  className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-900 font-extrabold hover:bg-slate-200 disabled:opacity-60 transition"
                >
                  ⬅ Back
                </button>

                {current < total - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                  >
                    Next ➡
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {submitting ? "Submitting..." : "Finish & Submit ✅"}
                  </button>
                )}
              </div>
            </div>
          </div>
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