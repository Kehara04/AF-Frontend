import { useState, useEffect } from "react";
import http from "../../api/http";

const FACES = [
    { emoji: "😄", label: "Happy", type: "positive", bg: "bg-sky-50", border: "border-sky-400", ring: "ring-sky-300", text: "text-sky-700" },
    { emoji: "😐", label: "Okay", type: "knowledge-sharing", bg: "bg-amber-50", border: "border-amber-400", ring: "ring-amber-300", text: "text-amber-700" },
    { emoji: "😢", label: "Sad", type: "negative", bg: "bg-rose-50", border: "border-rose-400", ring: "ring-rose-300", text: "text-rose-700" },
];

const BADGE_META = {
    "Beginner Scientist": { icon: "🔬", color: "text-slate-600", bg: "bg-slate-100" },
    "Junior Explorer": { icon: "🗺️", color: "text-amber-700", bg: "bg-amber-100" },
    "Senior Innovator": { icon: "🚀", color: "text-violet-700", bg: "bg-violet-100" },
    "Master Scientist": { icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-100" },
};

export default function FeedbackModal({ experimentId, tutorialTitle, onClose }) {
    // step: "loading" → 1 (face) → 2 (rating+comment) → 3 (success/badge)
    const [step, setStep] = useState("loading");

    // Pre-check state
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    // Step 1
    const [selectedFace, setSelectedFace] = useState(null);

    // Step 2
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");

    // Step 3
    const [completing, setCompleting] = useState(false);
    const [badge, setBadge] = useState(null);
    const [totalCompleted, setTotalCompleted] = useState(null);
    const [completeError, setCompleteError] = useState("");
    const [completed, setCompleted] = useState(false);

    // ── On mount: validate experimentId and check for existing feedback ──
    useEffect(() => {
        const expId = Number(experimentId);

        // Guard: experimentId must be a valid positive integer
        if (!experimentId || isNaN(expId) || expId <= 0) {
            setFeedbackError("Could not identify the experiment. Please close and try again.");
            setStep(1);
            return;
        }

        // Pre-check: has this kid already submitted feedback for this experiment?
        const checkExisting = async () => {
            try {
                const res = await http.get("/feedback/my");
                const myFeedbacks = res.data.feedbacks || [];
                const alreadyDone = myFeedbacks.some(
                    (f) => f.experiment?.experiment_id === expId
                );
                if (alreadyDone) {
                    setAlreadySubmitted(true);
                    setCompleted(true);
                    setStep(3);
                } else {
                    setStep(1);
                }
            } catch {
                // If the check fails for any reason, just proceed normally
                setStep(1);
            }
        };

        checkExisting();
    }, [experimentId]);

    const handleFaceSelect = (face) => setSelectedFace(face);

    const handleNextFromStep1 = () => {
        if (!selectedFace) return;
        setStep(2);
    };

    const handleSubmitFeedback = async () => {
        if (rating === 0) { setFeedbackError("Please select a star rating."); return; }
        if (!comment.trim()) { setFeedbackError("Please write a comment."); return; }

        const expId = Number(experimentId);
        if (!experimentId || isNaN(expId) || expId <= 0) {
            setFeedbackError("Could not identify the experiment. Please close and try again.");
            return;
        }

        setFeedbackError("");
        setSubmitting(true);
        try {
            await http.post("/feedback", {
                experiment: expId,
                feedbackType: selectedFace.type,
                comment: comment.trim(),
                rating,
            });
            setAlreadySubmitted(false);
            setStep(3);
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message || "Failed to submit feedback.";
            if (status === 409) {
                // Already submitted — move to success screen
                setAlreadySubmitted(true);
                setCompleted(true);
                setStep(3);
            } else {
                setFeedbackError(msg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkComplete = async () => {
        setCompleting(true);
        setCompleteError("");
        try {
            const expId = Number(experimentId);
            const res = await http.post(`/progress/complete/${expId}`);
            const p = res.data.progress;
            setBadge(p.badge);
            setTotalCompleted(p.totalCompleted);
            setCompleted(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to mark as complete.";
            if (err.response?.status === 409) {
                // Already completed
                setCompleted(true);
                setBadge(null);
            } else {
                setCompleteError(msg);
            }
        } finally {
            setCompleting(false);
        }
    };

    const activeFace = selectedFace;
    const badgeMeta = badge ? (BADGE_META[badge] || BADGE_META["Beginner Scientist"]) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in-up">

                {/* Gradient top bar */}
                <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl font-bold transition z-10"
                    aria-label="Close"
                >✕</button>

                <div className="p-6 sm:p-8">

                    {/* ─────────── LOADING ─────────── */}
                    {step === "loading" && (
                        <div className="text-center py-12 space-y-4">
                            <div className="inline-block w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                            <p className="text-slate-500 font-bold">Loading...</p>
                        </div>
                    )}

                    {/* ─────────── STEP 1: Face Picker ─────────── */}
                    {step === 1 && (
                        <div className="text-center space-y-6">
                            {feedbackError && (
                                <p className="text-rose-600 text-sm font-medium bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                                    ⚠ {feedbackError}
                                </p>
                            )}
                            <div>
                                <span className="text-4xl">🧪</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                                    You finished the experiment!
                                </h2>
                                <p className="text-slate-500 mt-1 text-sm font-medium">
                                    &ldquo;{tutorialTitle}&rdquo; — How did it go?
                                </p>
                            </div>

                            <div className="flex justify-center gap-4 sm:gap-6">
                                {FACES.map((face) => (
                                    <button
                                        key={face.type}
                                        onClick={() => handleFaceSelect(face)}
                                        className={`flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none
                                            ${activeFace?.type === face.type
                                                ? `${face.bg} ${face.border} ring-4 ${face.ring} scale-110 shadow-md`
                                                : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                            }`}
                                    >
                                        <span className="text-5xl sm:text-6xl leading-none select-none">{face.emoji}</span>
                                        <span className={`text-xs sm:text-sm font-bold ${activeFace?.type === face.type ? face.text : "text-slate-500"}`}>
                                            {face.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleNextFromStep1}
                                disabled={!selectedFace || !!feedbackError}
                                className={`w-full py-3 rounded-2xl font-black text-lg transition-all
                                    ${selectedFace && !feedbackError
                                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 hover:-translate-y-0.5"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                Next →
                            </button>
                        </div>
                    )}

                    {/* ─────────── STEP 2: Rating + Comment ─────────── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700 transition text-lg">←</button>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Rate your experience</h2>
                                    <p className="text-slate-500 text-sm">You felt: <span className="font-bold">{selectedFace?.emoji} {selectedFace?.label}</span></p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">How many stars? ⭐</label>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-4xl sm:text-5xl transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <span className={(hoverRating || rating) >= star ? "text-amber-400" : "text-slate-200"}>★</span>
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="text-center text-sm font-bold text-amber-600 mt-1">
                                        {["", "Not great 😕", "It was okay 🙂", "Pretty good 😊", "Really good 😄", "Amazing! 🤩"][rating]}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tell us more 💬</label>
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you learn? What was hard? Any suggestions?"
                                    className="w-full border-2 border-slate-200 rounded-2xl p-3 text-slate-700 text-sm resize-none focus:outline-none focus:border-violet-400 transition"
                                />
                            </div>

                            {feedbackError && (
                                <p className="text-rose-600 text-sm font-medium bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                                    ⚠ {feedbackError}
                                </p>
                            )}

                            <button
                                onClick={handleSubmitFeedback}
                                disabled={submitting}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-violet-200 hover:-translate-y-0.5 hover:shadow-violet-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Submitting..." : "Submit Feedback 🚀"}
                            </button>
                        </div>
                    )}

                    {/* ─────────── STEP 3: Success + Mark Complete ─────────── */}
                    {step === 3 && (
                        <div className="text-center space-y-6">
                            {!completed ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="text-6xl">🎉</div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Feedback submitted!</h2>
                                        <p className="text-slate-500 text-sm">Thanks for sharing how it went. Ready to earn your badge?</p>
                                    </div>

                                    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-2">
                                        <p className="text-violet-800 font-bold text-sm uppercase tracking-wide">🏅 Mark experiment as completed</p>
                                        <p className="text-violet-700 text-sm">Click below to officially complete this experiment and earn your progress badge!</p>
                                    </div>

                                    {completeError && (
                                        <p className="text-rose-600 text-sm font-medium bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                                            ⚠ {completeError}
                                        </p>
                                    )}

                                    <button
                                        onClick={handleMarkComplete}
                                        disabled={completing}
                                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-sky-200 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {completing ? "Completing..." : "✅ Mark as Completed!"}
                                    </button>

                                    <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 underline transition">
                                        Skip for now
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Already submitted info banner */}
                                    {alreadySubmitted && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                                            <p className="text-amber-700 font-bold text-sm">ℹ️ You already submitted feedback for this experiment.</p>
                                        </div>
                                    )}

                                    {/* Badge Earned Screen */}
                                    <div className="space-y-3">
                                        <div className="text-6xl">{badgeMeta ? badgeMeta.icon : "✅"}</div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Experiment Completed!</h2>
                                        {badge && totalCompleted !== null && (
                                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-lg ${badgeMeta.bg} ${badgeMeta.color} shadow-inner`}>
                                                {badgeMeta.icon} {badge}
                                            </div>
                                        )}
                                        {totalCompleted !== null && (
                                            <p className="text-slate-500 text-sm">
                                                You&apos;ve completed <span className="font-bold text-slate-700">{totalCompleted}</span> experiment{totalCompleted !== 1 ? "s" : ""} so far!
                                            </p>
                                        )}
                                        {!badge && !alreadySubmitted && (
                                            <p className="text-slate-500 text-sm">Great work! Keep going to earn more badges.</p>
                                        )}
                                    </div>

                                    {/* Badge progress hints */}
                                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                                        {[
                                            { icon: "🔬", label: "Beginner Scientist", threshold: "0+" },
                                            { icon: "🗺️", label: "Junior Explorer", threshold: "10+" },
                                            { icon: "🚀", label: "Senior Innovator", threshold: "20+" },
                                            { icon: "🏆", label: "Master Scientist", threshold: "30+" },
                                        ].map((b) => (
                                            <div key={b.label}
                                                className={`flex items-center gap-2 p-2 rounded-xl border ${badge === b.label ? "bg-violet-50 border-violet-300 text-violet-800" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
                                                <span className="text-lg">{b.icon}</span>
                                                <div>
                                                    <p className="font-bold leading-none">{b.label}</p>
                                                    <p className="opacity-70">{b.threshold} experiments</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-violet-600 text-white rounded-2xl font-black text-lg shadow-lg hover:-translate-y-0.5 transition-all"
                                    >
                                        Back to Tutorials 🏠
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
