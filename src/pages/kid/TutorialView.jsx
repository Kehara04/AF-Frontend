import { useEffect, useState, useMemo } from "react";
import http from "../../api/http";
import { useParams, Link, useNavigate } from "react-router-dom";
import FeedbackModal from "./FeedbackModal";

const getProgressKey = (tutorialId) => `kid_tutorial_progress_${tutorialId}`;

const saveProgress = (tutorialId, stepIndex) => {
    try { localStorage.setItem(getProgressKey(tutorialId), String(stepIndex)); } catch { }
};

const loadProgress = (tutorialId) => {
    try {
        const v = localStorage.getItem(getProgressKey(tutorialId));
        return v !== null ? parseInt(v, 10) : 0;
    } catch { return 0; }
};

const clearProgress = (tutorialId) => {
    try { localStorage.removeItem(getProgressKey(tutorialId)); } catch { }
};

export default function TutorialView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tutorial, setTutorial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [savedStep, setSavedStep] = useState(0);
    const [resumed, setResumed] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [noExpIdError, setNoExpIdError] = useState(false);

    // Resolve experimentId from tutorial fields (prefer externalExperimentId, fallback to populated experimentRef)
    const resolvedExperimentId = useMemo(() => {
        if (!tutorial) return null;
        const raw =
            tutorial.externalExperimentId ||
            tutorial.experimentRef?.experiment_id ||
            tutorial.experiment_id ||
            null;
        const num = Number(raw);
        return !isNaN(num) && num > 0 ? num : null;
    }, [tutorial]);

    useEffect(() => {
        fetchTutorial();
    }, [id]);

    const fetchTutorial = async () => {
        try {
            const res = await http.get(`/tutorials/${id}`);
            const data = res.data.data || res.data;
            setTutorial(data);
            const saved = loadProgress(id);
            if (saved > 0) {
                setCurrentStepIndex(saved);
                setSavedStep(saved);
                setResumed(true);
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold">Loading tutorial...</p>
            </div>
        );
    }

    if (error || !tutorial) {
        return (
            <div className="max-w-3xl mx-auto bg-white border border-red-100 rounded-3xl p-8 text-center shadow-sm">
                <span className="text-6xl mb-4 block">😢</span>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Oops! Something went wrong.</h2>
                <p className="text-red-600 mb-6">{error || "Tutorial not found."}</p>
                <Link to="/kid/tutorials" className="bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-xl hover:bg-slate-200 transition">
                    Go Back
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header section */}
            <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8">
                <Link to="/kid/tutorials" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-violet-600 mb-4 transition">
                    ← Back to Tutorials
                </Link>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{tutorial.title}</h1>

                {tutorial.expectedOutcome && (
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl mb-6">
                        <span className="font-bold text-sky-800 text-sm uppercase tracking-wide block mb-1">Expected Outcome</span>
                        <p className="text-sky-900">{tutorial.expectedOutcome}</p>
                    </div>
                )}

                {tutorial.safetyWarnings && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                        <span className="font-bold text-amber-800 text-sm uppercase tracking-wide flex items-center gap-1 mb-1">
                            ⚠ Safety First!
                        </span>
                        <p className="text-amber-900">{tutorial.safetyWarnings}</p>
                    </div>
                )}
            </div>

            {/* Video section */}
            {tutorial.youtube?.videoId && (
                <div className="bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-200" style={{ aspectRatio: "16/9" }}>
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${tutorial.youtube.videoId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Left Column: Steps */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-black text-slate-800 ml-2">Step by Step Guide 🚀</h2>

                    {/* Resume banner */}
                    {resumed && (
                        <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📍</span>
                                <div>
                                    <p className="font-bold text-violet-800 text-sm">Welcome back! Continuing from Step {savedStep + 1}</p>
                                    <p className="text-violet-600 text-xs mt-0.5">Your progress was saved automatically.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { clearProgress(id); setCurrentStepIndex(0); setResumed(false); }}
                                className="text-xs font-bold text-violet-500 hover:text-violet-700 underline whitespace-nowrap"
                            >
                                Restart 🔄
                            </button>
                        </div>
                    )}

                    {(!tutorial.steps || tutorial.steps.length === 0) ? (
                        <div className="bg-white rounded-3xl p-8 border shadow-sm text-center text-slate-500 font-medium">
                            No steps added yet for this tutorial. Watch the video above!
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6 lg:p-8">
                            {/* Progress circles with arrows */}
                            <div className="flex items-center justify-center mb-8 flex-wrap gap-y-4">
                                {tutorial.steps.map((step, idx) => {
                                    const isActive = idx === currentStepIndex;
                                    const isPast = idx < currentStepIndex;
                                    return (
                                        <div key={idx} className="flex items-center">
                                            <div
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 ${isActive
                                                    ? 'bg-violet-600 text-white shadow-lg scale-110 border-4 border-violet-100 ring-2 ring-violet-400 ring-opacity-50'
                                                    : isPast
                                                        ? 'bg-sky-500 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                                                    }`}
                                            >
                                                {step.stepNumber || (idx + 1)}
                                            </div>
                                            {idx < tutorial.steps.length - 1 && (
                                                <div className={`text-2xl mx-2 sm:mx-3 font-bold transition-colors ${isPast ? 'text-sky-500' : 'text-slate-300'}`}>
                                                    ➔
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current Step Content */}
                            <div className="bg-violet-50/50 rounded-2xl p-6 md:p-8 border border-violet-100 mb-8 min-h-[250px] shadow-inner flex flex-col justify-center">
                                {(() => {
                                    const step = tutorial.steps[currentStepIndex];
                                    return (
                                        <div key={currentStepIndex} className="animate-fade-in-up">
                                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">{step.title}</h3>
                                            <p className="text-slate-700 text-lg sm:text-xl leading-relaxed mb-6">{step.instruction}</p>

                                            {step.safetyNote && (
                                                <div className="text-sm sm:text-base rounded-xl bg-amber-50 text-amber-800 p-4 mb-3 font-medium border border-amber-200 flex gap-3 items-start">
                                                    <span className="text-2xl">⚠</span>
                                                    <div>
                                                        <span className="font-bold block mb-1">Safety Note</span>
                                                        {step.safetyNote}
                                                    </div>
                                                </div>
                                            )}

                                            {step.expectedResult && (
                                                <div className="text-sm sm:text-base rounded-xl bg-sky-50 text-sky-800 p-4 font-medium border border-sky-200 flex gap-3 items-start">
                                                    <span className="text-2xl">✨</span>
                                                    <div>
                                                        <span className="font-bold block mb-1">Looks like:</span>
                                                        {step.expectedResult}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentStepIndex === 0}
                                    className={`px-6 sm:px-8 py-3 rounded-full font-bold text-lg transition-all ${currentStepIndex === 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                        : 'bg-white text-violet-600 border-2 border-violet-200 hover:bg-violet-50 shadow-sm'
                                        }`}
                                >
                                    Previous
                                </button>

                                {currentStepIndex < tutorial.steps.length - 1 ? (
                                    <button
                                        onClick={() => {
                                            const next = currentStepIndex + 1;
                                            setCurrentStepIndex(next);
                                            saveProgress(id, next);
                                        }}
                                        className="px-8 py-3 bg-violet-600 text-white rounded-full font-black text-lg shadow-lg hover:bg-violet-700 hover:shadow-violet-300 transform hover:-translate-y-1 transition-all flex items-center gap-2"
                                    >
                                        Next ➔
                                    </button>
                                ) : (
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => {
                                                if (!resolvedExperimentId) {
                                                    setNoExpIdError(true);
                                                    return;
                                                }
                                                setNoExpIdError(false);
                                                clearProgress(id);
                                                setShowFeedback(true);
                                            }}
                                            className="px-8 py-3 bg-sky-500 text-white rounded-full font-black text-lg shadow-lg hover:bg-sky-600 hover:shadow-sky-300 transform hover:-translate-y-1 transition-all flex items-center gap-2"
                                        >
                                            Done! 🎉
                                        </button>
                                        {noExpIdError && (
                                            <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5">
                                                ⚠ Experiment not linked. Contact your admin.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="space-y-6">
                    {(tutorial.materials && tutorial.materials.length > 0) && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6">
                            <h3 className="font-black text-indigo-900 text-lg mb-3 flex items-center gap-2">
                                📦 Materials
                            </h3>
                            <ul className="space-y-2">
                                {tutorial.materials.map((mat, i) => (
                                    <li key={i} className="flex flex-wrap items-center gap-2 font-medium text-indigo-800 bg-white px-3 py-2 rounded-xl shadow-sm">
                                        <span className="text-indigo-400">•</span> {mat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {tutorial.scienceExplanation && (
                        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
                            <h3 className="font-black text-slate-800 text-lg mb-3 flex items-center gap-2">
                                🔬 The Science
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {tutorial.scienceExplanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback + Completion Modal */}
            {showFeedback && tutorial && resolvedExperimentId && (
                <FeedbackModal
                    experimentId={resolvedExperimentId}
                    tutorialTitle={tutorial.title}
                    onClose={() => { setShowFeedback(false); navigate('/kid/tutorials'); }}
                />
            )}
        </div>
    );
}
