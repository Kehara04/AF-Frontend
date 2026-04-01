import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import Toast from "../../components/Toast.jsx";
import bgImage from "../../assets/hero.jpg";

const emptyQuestion = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

const emptyCreateForm = () => ({
  experiment_id: "",
  title: "",
  questions: [emptyQuestion()],
});

const emptyUpdateForm = () => ({
  quiz_id: "",
  title: "",
  isActive: true,
  questions: [emptyQuestion()],
});

export default function AdminQuizManage() {
  const [msg, setMsg] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const [createForm, setCreateForm] = useState(emptyCreateForm());
  const [updateForm, setUpdateForm] = useState(emptyUpdateForm());

  const [busy, setBusy] = useState(false);
  const [busyUpdate, setBusyUpdate] = useState(false);
  const [busyDeleteId, setBusyDeleteId] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoadingList(true);
      const res = await http.get("/quizzes");
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.quizzes)
        ? res.data.quizzes
        : [];
      setQuizzes(list);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to load quizzes",
      });
    } finally {
      setLoadingList(false);
    }
  };

  const canCreate = useMemo(() => {
    if (!createForm.experiment_id) return false;
    if (!createForm.title.trim()) return false;
    if (!createForm.questions.length) return false;

    for (const q of createForm.questions) {
      if (!q.questionText.trim()) return false;
      if (!q.options || q.options.length !== 4) return false;
      if (q.options.some((o) => !String(o).trim())) return false;
      if (q.correctIndex < 0 || q.correctIndex > 3) return false;
    }
    return true;
  }, [createForm]);

  const canUpdate = useMemo(() => {
    if (!updateForm.quiz_id) return false;
    if (!updateForm.title.trim()) return false;
    if (!updateForm.questions.length) return false;

    for (const q of updateForm.questions) {
      if (!q.questionText.trim()) return false;
      if (!q.options || q.options.length !== 4) return false;
      if (q.options.some((o) => !String(o).trim())) return false;
      if (q.correctIndex < 0 || q.correctIndex > 3) return false;
    }
    return true;
  }, [updateForm]);

  const resetCreateForm = () => setCreateForm(emptyCreateForm());
  const resetUpdateForm = () => {
    setUpdateForm(emptyUpdateForm());
    setSelectedQuizId(null);
  };

  const setCreateQ = (idx, patch) => {
    setCreateForm((p) => {
      const qs = [...p.questions];
      qs[idx] = { ...qs[idx], ...patch };
      return { ...p, questions: qs };
    });
  };

  const setUpdateQ = (idx, patch) => {
    setUpdateForm((p) => {
      const qs = [...p.questions];
      qs[idx] = { ...qs[idx], ...patch };
      return { ...p, questions: qs };
    });
  };

  const addCreateQuestion = () =>
    setCreateForm((p) => ({ ...p, questions: [...p.questions, emptyQuestion()] }));

  const removeCreateQuestion = (i) =>
    setCreateForm((p) => ({
      ...p,
      questions: p.questions.filter((_, idx) => idx !== i),
    }));

  const addUpdateQuestion = () =>
    setUpdateForm((p) => ({ ...p, questions: [...p.questions, emptyQuestion()] }));

  const removeUpdateQuestion = (i) =>
    setUpdateForm((p) => ({
      ...p,
      questions: p.questions.filter((_, idx) => idx !== i),
    }));

  const normalizeQuestion = (q) => ({
    questionText: q?.questionText || "",
    options:
      Array.isArray(q?.options) && q.options.length === 4
        ? q.options.map((o) => String(o ?? ""))
        : ["", "", "", ""],
    correctIndex: Number.isInteger(q?.correctIndex) ? q.correctIndex : 0,
    explanation: q?.explanation || "",
  });

  const startEditQuiz = (quiz) => {
    setShowCreate(false);
    setSelectedQuizId(quiz.quiz_id);
    setUpdateForm({
      quiz_id: quiz.quiz_id,
      title: quiz.title || "",
      isActive: Boolean(quiz.isActive ?? quiz.is_active ?? true),
      questions:
        Array.isArray(quiz.questions) && quiz.questions.length
          ? quiz.questions.map(normalizeQuestion)
          : [emptyQuestion()],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!canCreate) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }

    const payload = {
      experiment_id: Number(createForm.experiment_id),
      title: createForm.title.trim(),
      questions: createForm.questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => String(o).trim()),
        correctIndex: Number(q.correctIndex),
        explanation: q.explanation?.trim() || "",
      })),
    };

    try {
      setBusy(true);
      const res = await http.post("/quizzes", payload);
      const createdId = res?.data?.quiz?.quiz_id;

      setMsg({
        type: "success",
        text: createdId ? `Quiz created ✅ (Quiz ID: ${createdId})` : "Quiz created ✅",
      });

      resetCreateForm();
      setShowCreate(false);
      await fetchQuizzes();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to create quiz",
      });
    } finally {
      setBusy(false);
    }
  };

  const updateQuiz = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!canUpdate) {
      setMsg({ type: "error", text: "Please fill all update fields." });
      return;
    }

    const payload = {
      title: updateForm.title.trim(),
      isActive: Boolean(updateForm.isActive),
      questions: updateForm.questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => String(o).trim()),
        correctIndex: Number(q.correctIndex),
        explanation: q.explanation?.trim() || "",
      })),
    };

    try {
      setBusyUpdate(true);
      await http.put(`/quizzes/${updateForm.quiz_id}`, payload);
      setMsg({ type: "success", text: "Quiz updated ✅" });
      await fetchQuizzes();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to update quiz",
      });
    } finally {
      setBusyUpdate(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    setMsg(null);
    try {
      setBusyDeleteId(quizId);
      await http.delete(`/quizzes/${quizId}`);
      setMsg({ type: "success", text: "Quiz deleted ✅" });

      if (Number(selectedQuizId) === Number(quizId)) {
        resetUpdateForm();
      }

      await fetchQuizzes();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete quiz",
      });
    } finally {
      setBusyDeleteId(null);
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  Admin Quiz Management 🧩
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Review quizzes first, then update or delete each one, or add a new quiz.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreate((prev) => !prev);
                  setSelectedQuizId(null);
                  resetUpdateForm();
                }}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition"
              >
                {showCreate ? "Close Add Quiz" : "+ Add New Quiz"}
              </button>
            </div>

            <div className="mt-4">
              <Toast type={msg?.type} text={msg?.text} />
            </div>
          </div>

          {showCreate && (
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900">Create Quiz</h3>
              <p className="text-slate-600 mt-1">
                Add a new quiz using a clean structured form.
              </p>

              <form onSubmit={createQuiz} className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Experiment ID">
                    <input
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                      value={createForm.experiment_id}
                      onChange={(e) =>
                        setCreateForm((p) => ({ ...p, experiment_id: e.target.value }))
                      }
                      placeholder="Example: 1"
                    />
                  </Field>

                  <Field label="Quiz Title">
                    <input
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                      value={createForm.title}
                      onChange={(e) =>
                        setCreateForm((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="Example: Water Basics Quiz"
                    />
                  </Field>
                </div>

                <SectionTop
                  title="Questions"
                  subtitle="Add options, choose the correct one, and include an explanation if needed."
                  buttonText="+ Add Question"
                  onClick={addCreateQuestion}
                />

                {createForm.questions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    idx={idx}
                    q={q}
                    onRemove={() => removeCreateQuestion(idx)}
                    onChange={(patch) => setCreateQ(idx, patch)}
                  />
                ))}

                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={busy}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 disabled:opacity-60 transition"
                  >
                    {busy ? "Creating..." : "Create Quiz ✅"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetCreateForm();
                      setShowCreate(false);
                    }}
                    className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid xl:grid-cols-[1.2fr_0.9fr] gap-6">
            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Quiz List</h3>
                  <p className="text-slate-600 mt-1">
                    Select a quiz to edit, or delete directly from the list.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchQuizzes}
                  className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {loadingList ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 font-medium">
                    Loading quizzes...
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <div className="text-lg font-black text-slate-900">No quizzes found</div>
                    <div className="text-slate-600 mt-2">
                      Add your first quiz to get started.
                    </div>
                  </div>
                ) : (
                  quizzes.map((quiz) => {
                    const isSelected = Number(selectedQuizId) === Number(quiz.quiz_id);
                    return (
                      <div
                        key={quiz.quiz_id}
                        className={`rounded-[28px] border p-5 shadow-sm transition ${
                          isSelected
                            ? "border-sky-300 bg-sky-50/80"
                            : "border-slate-200 bg-slate-50/95"
                        }`}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-xl font-black text-slate-900">
                                {quiz.title || `Quiz #${quiz.quiz_id}`}
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                  quiz.isActive ?? quiz.is_active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {quiz.isActive ?? quiz.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="mt-2 text-sm text-slate-600 space-y-1">
                              <div><b>Quiz ID:</b> {quiz.quiz_id}</div>
                              {quiz.experiment_id != null && (
                                <div><b>Experiment ID:</b> {quiz.experiment_id}</div>
                              )}
                              <div>
                                <b>Questions:</b> {Array.isArray(quiz.questions) ? quiz.questions.length : 0}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startEditQuiz(quiz)}
                              className="px-5 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
                            >
                              Update ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteQuiz(quiz.quiz_id)}
                              disabled={busyDeleteId === quiz.quiz_id}
                              className="px-5 py-3 rounded-2xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 disabled:opacity-60 transition"
                            >
                              {busyDeleteId === quiz.quiz_id ? "Deleting..." : "Delete 🗑️"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900">Update Quiz</h3>
              <p className="text-slate-600 mt-1">
                Pick a quiz from the list to load its details here.
              </p>

              {!selectedQuizId ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="text-lg font-black text-slate-900">No quiz selected</div>
                  <div className="text-slate-600 mt-2">
                    Click <b>Update</b> on a quiz from the list to edit it.
                  </div>
                </div>
              ) : (
                <form onSubmit={updateQuiz} className="mt-6 space-y-6">
                  <div className="grid gap-4">
                    <Field label="Quiz ID">
                      <input
                        disabled
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
                        value={updateForm.quiz_id}
                      />
                    </Field>

                    <Field label="Title">
                      <input
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        value={updateForm.title}
                        onChange={(e) =>
                          setUpdateForm((p) => ({ ...p, title: e.target.value }))
                        }
                        placeholder="New title"
                      />
                    </Field>
                  </div>

                  <label className="inline-flex items-center gap-3 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(updateForm.isActive)}
                      onChange={(e) =>
                        setUpdateForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                      className="w-4 h-4 rounded"
                    />
                    Quiz is Active
                  </label>

                  <SectionTop
                    title="Questions"
                    subtitle="Edit questions using the same structured layout."
                    buttonText="+ Add Question"
                    onClick={addUpdateQuestion}
                  />

                  {updateForm.questions.map((q, idx) => (
                    <QuestionCard
                      key={idx}
                      idx={idx}
                      q={q}
                      onRemove={() => removeUpdateQuestion(idx)}
                      onChange={(patch) => setUpdateQ(idx, patch)}
                    />
                  ))}

                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={busyUpdate}
                      className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 disabled:opacity-60 transition"
                    >
                      {busyUpdate ? "Updating..." : "Save Changes ✏️"}
                    </button>

                    <button
                      type="button"
                      onClick={resetUpdateForm}
                      className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
                    >
                      Close Editor
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTop({ title, subtitle, buttonText, onClick }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-extrabold text-slate-900">{title}</div>
        <div className="text-slate-600 text-sm">{subtitle}</div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="px-5 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
      >
        {buttonText}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-extrabold text-slate-800 mb-2">{label}</div>
      {children}
    </label>
  );
}

function QuestionCard({ idx, q, onRemove, onChange }) {
  const setOpt = (i, v) => {
    const next = [...q.options];
    next[i] = v;
    onChange({ options: next });
  };

  return (
    <div className="bg-slate-50/95 border border-slate-200 rounded-[28px] p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black text-slate-900">Question {idx + 1}</div>
          <div className="text-slate-600 text-sm">
            Choose the correct option and optionally add an explanation.
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-200 font-extrabold hover:bg-slate-100 transition"
        >
          Remove
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Question Text">
          <input
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={q.questionText}
            onChange={(e) => onChange({ questionText: e.target.value })}
            placeholder="Type the question..."
          />
        </Field>

        <div className="grid md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-start bg-white rounded-2xl border border-slate-200 p-3">
              <input
                type="radio"
                name={`correct-${idx}`}
                className="mt-3"
                checked={Number(q.correctIndex) === i}
                onChange={() => onChange({ correctIndex: i })}
              />
              <div className="flex-1">
                <div className="text-sm font-extrabold text-slate-800 mb-1">
                  Option {i + 1}
                </div>
                <input
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  value={q.options[i]}
                  onChange={(e) => setOpt(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
              </div>
            </div>
          ))}
        </div>

        <Field label="Explanation (Optional)">
          <textarea
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 min-h-[100px]"
            value={q.explanation}
            onChange={(e) => onChange({ explanation: e.target.value })}
            placeholder="Explain why the answer is correct..."
          />
        </Field>
      </div>
    </div>
  );
}
