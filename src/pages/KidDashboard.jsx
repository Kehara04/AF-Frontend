import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";

const BADGE_META = {
  "Beginner Scientist": { icon: "🔬", color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200", next: "Junior Explorer", nextAt: 10 },
  "Junior Explorer": { icon: "🗺️", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", next: "Senior Innovator", nextAt: 20 },
  "Senior Innovator": { icon: "🚀", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", next: "Master Scientist", nextAt: 30 },
  "Master Scientist": { icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", next: null, nextAt: null },
};

const TYPE_META = {
  positive: { emoji: "😄", label: "Happy" },
  "knowledge-sharing": { emoji: "😐", label: "Okay" },
  negative: { emoji: "😢", label: "Sad" },
};

export default function KidDashboard() {
  const { user } = useAuth();

  const [progress, setProgress] = useState(null);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [deletingFeedback, setDeletingFeedback] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null); // feedback_id being edited
  const [editDraft, setEditDraft] = useState({ feedbackType: "", rating: 0, comment: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const startEdit = (f) => {
    setEditingFeedback(f.feedback_id);
    setEditDraft({ feedbackType: f.feedbackType, rating: f.rating, comment: f.comment || "" });
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingFeedback(null);
    setEditError("");
  };

  const handleSaveEdit = async (feedbackId) => {
    if (!editDraft.rating) { setEditError("Please select a star rating."); return; }
    if (!editDraft.comment.trim()) { setEditError("Please write a comment."); return; }
    setSavingEdit(true);
    setEditError("");
    try {
      await http.put(`/feedback/${feedbackId}`, {
        feedbackType: editDraft.feedbackType,
        rating: editDraft.rating,
        comment: editDraft.comment.trim(),
      });
      setEditingFeedback(null);
      fetchMyFeedback();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchMyFeedback = () => {
    setLoadingFeedback(true);
    http.get("/feedback/my")
      .then((res) => setMyFeedbacks(res.data.feedbacks || []))
      .catch(() => setMyFeedbacks([]))
      .finally(() => setLoadingFeedback(false));
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Delete this feedback? This cannot be undone.")) return;
    setDeletingFeedback(feedbackId);
    try {
      await http.delete(`/feedback/${feedbackId}`);
      fetchMyFeedback();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete feedback.");
    } finally {
      setDeletingFeedback(null);
    }
  };

  useEffect(() => {
    // GET /progress/my
    http.get("/progress/my")
      .then((res) => setProgress(res.data.progress || null))
      .catch(() => setProgress(null))
      .finally(() => setLoadingProgress(false));

    // GET /feedback/my
    fetchMyFeedback();
  }, []);

  const badge = progress?.badge || "Beginner Scientist";
  const totalCompleted = progress?.totalCompleted || 0;
  const badgeMeta = BADGE_META[badge] || BADGE_META["Beginner Scientist"];

  // Progress bar toward next badge
  let progressPct = 100;
  if (badgeMeta.nextAt) {
    const prevAt = badge === "Beginner Scientist" ? 0 : badge === "Junior Explorer" ? 10 : badge === "Senior Innovator" ? 20 : 30;
    progressPct = Math.min(100, Math.round(((totalCompleted - prevAt) / (badgeMeta.nextAt - prevAt)) * 100));
  }

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
        <h2 className="text-3xl font-black text-slate-900">Kid Dashboard 🧒✨</h2>
        <p className="text-slate-600 mt-1 font-semibold">
          Hi {user?.name || user?.email}! Pick what you want to do next.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* <ActionCard title="Science Kits" emoji="📦" text="Browse kits & order one." to="#" /> */}
          <ActionCard title="Experiments" emoji="🧪" text="See experiments and place order." to="/kid/experiments" />
          <ActionCard title="Tutorials" emoji="🎥" text="Follow step-by-step tutorials." to="/kid/tutorials" />
          <ActionCard title="Quizzes" emoji="📝" text="Try quizzes and learn fast." to="/kid/quizzes" />
          <ActionCard title="My Quiz History" emoji="📜" text="See all your attempts." to="/kid/quizzes/history" />
          <ActionCard title="My Profile" emoji="👋" text="See your details & progress." to="/profile" />
        </div>
      </div>

      {/* Progress & Badge Panel */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
        <h3 className="text-xl font-black text-slate-800 mb-4">My Progress 🏅</h3>

        {loadingProgress ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-6 h-6 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <span className="text-slate-500 font-medium text-sm">Loading progress...</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Badge pill */}
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 ${badgeMeta.bg} ${badgeMeta.border} shrink-0`}>
              <span className="text-4xl">{badgeMeta.icon}</span>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Badge</p>
                <p className={`text-lg font-black ${badgeMeta.color}`}>{badge}</p>
                <p className="text-xs text-slate-500 mt-0.5">{totalCompleted} experiment{totalCompleted !== 1 ? "s" : ""} completed</p>
              </div>
            </div>

            {/* Progress toward next badge */}
            {badgeMeta.next ? (
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Progress to {badgeMeta.next}</span>
                  <span>{totalCompleted} / {badgeMeta.nextAt}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.max(0, badgeMeta.nextAt - totalCompleted)} more to unlock {badgeMeta.next}!
                </p>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-sm font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-2 inline-block">
                  🏆 You've reached the highest badge! Amazing!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Badge ladder */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(BADGE_META).map(([name, meta]) => {
            const isEarned = Object.keys(BADGE_META).indexOf(name) <= Object.keys(BADGE_META).indexOf(badge);
            return (
              <div
                key={name}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all
                                    ${isEarned
                    ? `${meta.bg} ${meta.border} ${meta.color}`
                    : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}
              >
                <span className="text-xl">{meta.icon}</span>
                <span>{name}</span>
                {badge === name && <span className="ml-auto text-lg">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* My Feedback History */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
        <h3 className="text-xl font-black text-slate-800 mb-4">My Feedback History 💬</h3>

        {loadingFeedback ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-6 h-6 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <span className="text-slate-500 font-medium text-sm">Loading feedback...</span>
          </div>
        ) : myFeedbacks.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="font-medium text-sm">No feedback submitted yet.</p>
            <p className="text-xs mt-1">Complete a tutorial and share how it went!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myFeedbacks.map((f) => {
              const isEditing = editingFeedback === f.feedback_id;
              const typeMeta = TYPE_META[f.feedbackType] || TYPE_META["knowledge-sharing"];
              const date = new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <div key={f._id} className={`p-4 rounded-2xl border transition-all ${isEditing ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-100"}`}>

                  {/* ── View Mode ── */}
                  {!isEditing && (
                    <div className="flex items-start gap-4">
                      <span className="text-3xl shrink-0">{typeMeta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-black text-slate-800 text-sm truncate">{f.experiment?.title || "Unknown Experiment"}</p>
                          <span className="text-xs text-slate-400 whitespace-nowrap">{date}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={s <= f.rating ? "text-amber-400 text-sm" : "text-slate-200 text-sm"}>★</span>
                            ))}
                          </span>
                          <span className="text-xs font-medium text-slate-500">{f.rating}/5</span>
                        </div>
                        {f.comment && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{f.comment}</p>}
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => startEdit(f)}
                          className="px-3 py-1.5 text-xs font-bold bg-violet-50 text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(f.feedback_id)}
                          disabled={deletingFeedback === f.feedback_id}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingFeedback === f.feedback_id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Edit Mode ── */}
                  {isEditing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-violet-800 text-sm">
                          ✏️ Editing: {f.experiment?.title || "Unknown Experiment"}
                        </p>
                        <button onClick={cancelEdit} className="text-xs text-slate-400 hover:text-slate-600 transition">✕ Cancel</button>
                      </div>

                      {/* Emoji type picker */}
                      <div>
                        <p className="text-xs font-bold text-slate-600 mb-2">How did you feel?</p>
                        <div className="flex gap-3">
                          {Object.entries(TYPE_META).map(([type, meta]) => (
                            <button
                              key={type}
                              onClick={() => setEditDraft(d => ({ ...d, feedbackType: type }))}
                              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl border-2 text-sm font-bold transition-all ${editDraft.feedbackType === type
                                ? "bg-violet-100 border-violet-400 scale-105 text-violet-700"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                }`}
                            >
                              <span className="text-2xl">{meta.emoji}</span>
                              <span>{meta.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Star rating */}
                      <div>
                        <p className="text-xs font-bold text-slate-600 mb-1">Star rating</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setEditDraft(d => ({ ...d, rating: s }))}
                              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                            >
                              <span className={editDraft.rating >= s ? "text-amber-400" : "text-slate-200"}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <p className="text-xs font-bold text-slate-600 mb-1">Comment</p>
                        <textarea
                          rows={3}
                          value={editDraft.comment}
                          onChange={(e) => setEditDraft(d => ({ ...d, comment: e.target.value }))}
                          className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:border-violet-400 transition"
                          placeholder="Update your comment..."
                        />
                      </div>

                      {editError && (
                        <p className="text-rose-600 text-xs font-medium bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5">⚠ {editError}</p>
                      )}

                      {/* Save / Cancel */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(f.feedback_id)}
                          disabled={savingEdit}
                          className="flex-1 py-2 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {savingEdit ? "Saving..." : "Save Changes ✅"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function ActionCard({ title, emoji, text, to }) {
  return (
    <Link to={to} className="group bg-white/30 backdrop-blur-sm border border-white/40 rounded-3xl p-5 hover:bg-white/50 hover:shadow-md transition">
      <div className="text-3xl">{emoji}</div>
      <div className="mt-2 text-lg font-black text-slate-900 group-hover:text-sky-700">{title}</div>
      <div className="mt-1 text-slate-600 font-semibold text-sm">{text}</div>
    </Link>
  );
}