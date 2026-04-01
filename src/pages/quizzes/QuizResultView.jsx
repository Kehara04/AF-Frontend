import { Link, useLocation } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import bgImage from "../../assets/hero.jpg";

export default function QuizResultView() {
  const { state } = useLocation();
  const r = state?.result;

  if (!r) {
    return (
      <div
        className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="min-h-screen bg-white/70 backdrop-blur-[2px] p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-3xl font-black text-slate-900">No Result Found</h2>
              <p className="text-slate-600 mt-2 font-medium">
                We could not find a quiz result to display. Go back and start a quiz first.
              </p>

              <div className="mt-6">
                <Link
                  className="inline-flex px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                  to="/kid/quizzes"
                >
                  Go to Quizzes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const percentage = Number(r.percentage || 0);

  let badgeClass = "bg-rose-100 text-rose-700";
  let badgeText = "Needs Improvement";
  let message =
    "Keep practicing and review the explanations below to improve next time.";

  if (percentage >= 80) {
    badgeClass = "bg-emerald-100 text-emerald-700";
    badgeText = "Excellent";
    message = "Amazing work! You performed very well on this quiz.";
  } else if (percentage >= 50) {
    badgeClass = "bg-amber-100 text-amber-700";
    badgeText = "Good Attempt";
    message = "Nice effort! Review the feedback below and try again for a higher score.";
  }

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
                  Quiz Feedback ✅
                </h2>
                <p className="text-slate-600 mt-2 font-medium">{message}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/kid/quizzes/${r.experiment_id}`}
                  className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                >
                  Try Again 🔁
                </Link>

                <Link
                  to="/kid/quizzes/history"
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black transition"
                >
                  My History 📜
                </Link>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Attempt Number" value={`#${r.attemptNumber}`} />
            <StatCard label="Quiz ID" value={r.quiz_id} />
            <StatCard label="Experiment ID" value={r.experiment_id} />
            <StatCard label="Score" value={`${r.correctCount}/${r.totalQuestions}`} />
          </div>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-6xl">
                  {percentage >= 80 ? "🏆" : percentage >= 50 ? "🎯" : "📘"}
                </div>

                <div className="mt-4">
                  <div className="text-4xl font-black text-slate-900">
                    {percentage}%
                  </div>
                  <div className="text-slate-600 font-medium mt-1">
                    Overall Percentage
                  </div>
                </div>

                <span className={`mt-4 px-4 py-2 rounded-full text-sm font-extrabold ${badgeClass}`}>
                  {badgeText}
                </span>
              </div>

              <div className="mt-6">
                <ProgressBar value={percentage} />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard title="Correct Answers" value={r.correctCount} emoji="✅" />
                <InfoCard title="Wrong / Missed" value={r.totalQuestions - r.correctCount} emoji="❌" />
                <InfoCard title="Total Questions" value={r.totalQuestions} emoji="📚" />
                <InfoCard title="Attempt" value={r.attemptNumber} emoji="🔁" />
              </div>
            </div>

            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900">
                Performance Summary
              </h3>
              <p className="text-slate-600 mt-1">
                Review your score and go through each question’s feedback below.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <DetailField label="Attempt Number" value={`#${r.attemptNumber}`} />
                <DetailField label="Percentage" value={`${percentage}%`} />
                <DetailField label="Score" value={`${r.correctCount}/${r.totalQuestions}`} />
                <DetailField label="Experiment ID" value={String(r.experiment_id)} />
                <DetailField label="Quiz ID" value={String(r.quiz_id)} />
                <DetailField label="Questions Reviewed" value={String(r.perQuestion?.length || 0)} />
              </div>
            </div>
          </div>

          <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
            <h3 className="text-2xl font-black text-slate-900">
              Question-by-Question Feedback
            </h3>
            <p className="text-slate-600 mt-1">
              See where you answered correctly and learn from the explanations.
            </p>

            <div className="mt-6 space-y-4">
              {r.perQuestion.map((pq) => (
                <div
                  key={pq.questionIndex}
                  className="rounded-[28px] border border-slate-200 bg-slate-50/95 p-5 md:p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        Question {pq.questionIndex + 1}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            pq.isCorrect
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {pq.isCorrect ? "Correct ✅" : "Wrong ❌"}
                        </span>
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Correct Answer
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {String.fromCharCode(65 + pq.correctIndex)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <InfoPill
                      label="Your Answer"
                      value={
                        pq.selectedIndex === null
                          ? "Not Answered"
                          : String.fromCharCode(65 + pq.selectedIndex)
                      }
                    />
                    <InfoPill
                      label="Correct Answer"
                      value={String.fromCharCode(65 + pq.correctIndex)}
                    />
                    <InfoPill
                      label="Result"
                      value={pq.isCorrect ? "Correct" : "Incorrect"}
                    />
                  </div>

                  {pq.explanation ? (
                    <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 text-slate-700 font-medium">
                      <div className="font-black text-slate-900 mb-1">💡 Explanation</div>
                      {pq.explanation}
                    </div>
                  ) : null}
                </div>
              ))}
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

function InfoCard({ title, value, emoji }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="font-extrabold text-slate-900 mt-1">{title}</div>
      <div className="text-slate-700">{value}</div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wide font-extrabold text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900 break-all">{value}</div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 min-w-0">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-800 truncate">{value}</div>
    </div>
  );
}