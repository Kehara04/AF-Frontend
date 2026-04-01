import { useEffect, useState } from "react";
import http from "../../api/http";

// ── Primitives ────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "violet" }) => {
  const map = { violet: "bg-violet-100 text-violet-700", emerald: "bg-emerald-100 text-emerald-700", red: "bg-red-100 text-red-700", sky: "bg-sky-100 text-sky-700", amber: "bg-amber-100 text-amber-700" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[color]}`}>{children}</span>;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl ${className}`}>{children}</div>
);

const Btn = ({ children, onClick, color = "violet", size = "md", disabled, className = "" }) => {
  const colors = { violet: "bg-violet-500 hover:bg-violet-600 text-white", emerald: "bg-emerald-500 hover:bg-emerald-600 text-white", red: "bg-red-500 hover:bg-red-600 text-white", gray: "bg-gray-100 hover:bg-gray-200 text-gray-700", sky: "bg-sky-500 hover:bg-sky-600 text-white" };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-2.5 text-base" };
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-xl font-semibold transition-all duration-150 disabled:opacity-40 ${colors[color]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
    <input {...props} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
    <textarea {...props} rows={3} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50 resize-none" />
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Step Builder ──────────────────────────────────────────────────────────────
const StepBuilder = ({ steps, onChange }) => {
  const add = () => onChange([...steps, { stepNumber: steps.length + 1, title: "", instruction: "", safetyNote: "", expectedResult: "", imageUrl: "" }]);
  const remove = (i) => onChange(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  const update = (i, field, val) => onChange(steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Steps</span>
        <Btn size="sm" color="sky" onClick={add}>+ Add Step</Btn>
      </div>
      {steps.map((step, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <Badge color="violet">Step {step.stepNumber}</Badge>
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
          </div>
          <Input placeholder="Step title" value={step.title} onChange={e => update(i, "title", e.target.value)} />
          <Textarea placeholder="Instruction…" value={step.instruction} onChange={e => update(i, "instruction", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Safety note" value={step.safetyNote} onChange={e => update(i, "safetyNote", e.target.value)} />
            <Input placeholder="Expected result" value={step.expectedResult} onChange={e => update(i, "expectedResult", e.target.value)} />
          </div>
          <Input placeholder="Image URL (optional)" value={step.imageUrl} onChange={e => update(i, "imageUrl", e.target.value)} />
        </div>
      ))}
      {steps.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No steps yet — click "+ Add Step"</p>}
    </div>
  );
};

// ── Tutorial Form ─────────────────────────────────────────────────────────────
const DRAFT_KEY = "tutorialFormDraft";
const emptyForm = () => ({ experimentId: "", title: "", safetyWarnings: "", expectedOutcome: "", scienceExplanation: "", materials: "", steps: [] });

const saveDraft = (data) => {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { }
};
const loadDraft = () => {
  try { const d = localStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
};
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { } };

const TutorialForm = ({ initial, onSave, onCancel, experiments = [], experimentsLoading = false, usedExperimentIds = [], editingExperimentId = null }) => {
  const draft = !initial ? loadDraft() : null;
  const [form, setForm] = useState(draft || initial || emptyForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [draftRestored, setDraftRestored] = useState(!!draft);

  const set = (k, v) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (!initial) saveDraft(updated);
      return updated;
    });
  };

  const handleClearDraft = () => {
    clearDraft();
    setForm(initial || emptyForm());
    setDraftRestored(false);
  };

  const submit = async () => {
    setSaving(true); setErr("");
    try {
      await onSave({ ...form, materials: form.materials ? form.materials.split(",").map(m => m.trim()).filter(Boolean) : [] });
      clearDraft();
    } catch (e) { setErr(e.response?.data?.error?.message || e.message); }
    finally { setSaving(false); }
  };

  // Filter experiments that already have tutorials
  const availableExperiments = experiments.filter(exp => {
    const expIdStr = String(exp.experiment_id ?? exp._id);
    // Allow if it's the one we are currently editing
    if (editingExperimentId && String(editingExperimentId) === expIdStr) return true;
    // Otherwise, check if it's NOT in the used list
    return !usedExperimentIds.includes(expIdStr);
  });

  return (
    <div className="space-y-4">
      {draftRestored && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
          <span>📝 <strong>Draft restored</strong> — your previous unsaved changes have been loaded.</span>
          <button onClick={handleClearDraft} className="text-amber-600 hover:text-amber-800 font-semibold underline text-xs whitespace-nowrap">Clear draft</button>
        </div>
      )}
      {err && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm">{err}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experiment</label>
          <select
            value={form.experimentId}
            onChange={e => set("experimentId", e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50"
          >
            <option value="">Select experiment…</option>
            {availableExperiments.map((exp) => (
              <option
                key={exp._id || exp.experiment_id}
                value={String(exp.experiment_id ?? exp._id)}
              >
                #{exp.experiment_id ?? "?"} — {exp.title}
              </option>
            ))}
          </select>
          {experimentsLoading && (
            <p className="text-[11px] text-gray-400 mt-0.5">Loading experiments…</p>
          )}
        </div>
        <Input label="Title" placeholder="Tutorial title" value={form.title} onChange={e => set("title", e.target.value)} />
      </div>
      <Textarea label="Safety Warnings" placeholder="Any safety precautions…" value={form.safetyWarnings} onChange={e => set("safetyWarnings", e.target.value)} />
      <Textarea label="Expected Outcome" placeholder="What will happen…" value={form.expectedOutcome} onChange={e => set("expectedOutcome", e.target.value)} />
      <Textarea label="Science Explanation" placeholder="The science behind it…" value={form.scienceExplanation} onChange={e => set("scienceExplanation", e.target.value)} />
      <Input label="Materials (comma-separated)" placeholder="e.g. beaker, water, vinegar" value={form.materials} onChange={e => set("materials", e.target.value)} />
      <StepBuilder steps={form.steps} onChange={v => set("steps", v)} />
      <div className="flex gap-2 pt-2">
        <Btn onClick={submit} disabled={saving} color="sky" size="lg">{saving ? "Saving…" : "Save Tutorial"}</Btn>
        <Btn onClick={onCancel} color="gray" size="lg">Cancel</Btn>
      </div>
    </div>
  );
};

// ── YouTube Panel ─────────────────────────────────────────────────────────────
const YoutubePanel = ({ tutorial, onClose, onUpdated }) => {
  const [query, setQuery] = useState(tutorial.youtube?.searchQuery || tutorial.title || "");
  const [results, setResults] = useState(tutorial.youtube?.resultsCache || []);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const [err, setErr] = useState("");

  const search = async () => {
    setLoading(true); setErr("");
    try {
      const res = await http.get("/youtube/search", { params: { q: query, max: 6, tutorialId: tutorial._id } });
      setResults(res.data.data.items);
    } catch (e) { setErr(e.response?.data?.error?.message || e.message); }
    finally { setLoading(false); }
  };

  const selectVideo = async (video) => {
    setSelecting(video.videoId);
    try {
      await http.patch(`/tutorials/${tutorial._id}/youtube/select`, { videoId: video.videoId, searchQuery: query });
      onUpdated(); onClose();
    } catch (e) { setErr(e.response?.data?.error?.message || e.message); }
    finally { setSelecting(null); }
  };

  return (
    <div className="space-y-4">
      {tutorial.youtube?.videoUrl && (
        <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">▶</span>
          <a href={tutorial.youtube.videoUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold text-sm underline truncate">
            Current: {tutorial.youtube.videoId}
          </a>
        </div>
      )}
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search YouTube…"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-gray-50" />
        <Btn onClick={search} color="red" disabled={loading}>{loading ? "…" : "🔍 Search"}</Btn>
      </div>
      {err && <p className="text-red-500 text-sm">{err}</p>}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {results.map(v => (
          <div key={v.videoId} className="flex gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
            <img src={v.thumbnailUrl} alt={v.title} className="w-24 h-14 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">{v.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{v.channelTitle}</p>
            </div>
            <Btn size="sm" color="red" disabled={selecting === v.videoId} onClick={() => selectVideo(v)}>
              {selecting === v.videoId ? "…" : "Select"}
            </Btn>
          </div>
        ))}
        {results.length === 0 && !loading && <p className="text-center text-sm text-gray-400 py-6">Search for videos above 🎬</p>}
      </div>
    </div>
  );
};

// ── Steps Viewer ──────────────────────────────────────────────────────────────
const StepsViewer = ({ tutorial }) => (
  <div className="space-y-4">
    {tutorial.youtube?.videoUrl && (
      <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${tutorial.youtube.videoId}`} title="Tutorial video" allowFullScreen className="w-full h-full" />
      </div>
    )}
    <div className="space-y-2">
      {(tutorial.steps || []).map(step => (
        <div key={step.stepNumber} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold flex-shrink-0">{step.stepNumber}</div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-800">{step.title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{step.instruction}</p>
            {step.safetyNote && <p className="text-xs text-amber-600 mt-1">⚠ {step.safetyNote}</p>}
            {step.expectedResult && <p className="text-xs text-emerald-600 mt-1">✓ {step.expectedResult}</p>}
          </div>
        </div>
      ))}
      {!(tutorial.steps?.length) && <p className="text-center text-gray-400 text-sm py-6">No steps available</p>}
    </div>
  </div>
);

// ── Tutorial Card ─────────────────────────────────────────────────────────────
const TutorialCard = ({ tutorial, onEdit, onDelete, onYoutube, onViewSteps }) => (
  <Card className="p-5 hover:shadow-md transition-shadow duration-200">
    <div className="flex gap-2 flex-wrap mb-2">
      <Badge color="violet">#{tutorial.tutorial_id}</Badge>
      {tutorial.youtube?.videoId && <Badge color="red">▶ YouTube</Badge>}
      <Badge color="sky">{(tutorial.steps || []).length} steps</Badge>
    </div>
    <h3 className="font-bold text-gray-800 text-base">{tutorial.title}</h3>
    {tutorial.expectedOutcome && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tutorial.expectedOutcome}</p>}
    {tutorial.safetyWarnings && <p className="text-xs text-amber-600 mt-1">⚠ {tutorial.safetyWarnings}</p>}
    <div className="flex gap-2 mt-4 flex-wrap">
      <Btn size="sm" color="gray" onClick={() => onViewSteps(tutorial)}>👁 Steps</Btn>
      <Btn size="sm" color="sky" onClick={() => onYoutube(tutorial)}>🎬 YouTube</Btn>
      <Btn size="sm" color="violet" onClick={() => onEdit(tutorial)}>✏️ Edit</Btn>
      <Btn size="sm" color="red" onClick={() => onDelete(tutorial)}>🗑 Delete</Btn>
    </div>
  </Card>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TutorialManager() {
  const [allTutorials, setAllTutorials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [experiments, setExperiments] = useState([]);
  const [experimentsLoading, setExperimentsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTutorial, setEditTutorial] = useState(null);
  const [youtubeTutorial, setYoutubeTutorial] = useState(null);
  const [stepsTutorial, setStepsTutorial] = useState(null);
  const [stepsData, setStepsData] = useState(null);

  // Fetch all experiments then load tutorials for each in parallel
  const fetchAllTutorials = async (expList) => {
    const list = expList || experiments;
    if (!list.length) return;
    setLoading(true); setErr("");
    try {
      const results = await Promise.allSettled(
        list.map(exp =>
          http.get(`/tutorials/experiment/${exp.experiment_id}`)
            .then(r => r.data.data.items || [])
            .catch(() => [])
        )
      );
      const merged = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
      // deduplicate by _id
      const seen = new Set();
      setAllTutorials(merged.filter(t => { if (seen.has(t._id)) return false; seen.add(t._id); return true; }));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const fetchExperiments = async () => {
    setExperimentsLoading(true);
    try {
      const res = await http.get("/experiments");
      const expList = Array.isArray(res.data) ? res.data : [];
      setExperiments(expList);
      fetchAllTutorials(expList);
    } catch (e) {
      console.error("Failed to load experiments", e);
    } finally {
      setExperimentsLoading(false);
    }
  };

  useEffect(() => { fetchExperiments(); }, []);

  // Filtered tutorials based on search query
  const tutorials = searchQuery.trim()
    ? allTutorials.filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : allTutorials;

  const loadSteps = async (tutorial) => {
    try {
      const res = await http.get(`/tutorials/${tutorial._id}/steps`);
      setStepsData(res.data.data);
      setStepsTutorial(tutorial);
    } catch (e) { alert(e.response?.data?.error?.message || e.message); }
  };

  const handleCreate = async (payload) => {
    await http.post("/tutorials", payload);
    setCreateOpen(false);
    fetchAllTutorials();
  };

  const handleEdit = async (payload) => {
    await http.put(`/tutorials/${editTutorial._id}`, payload);
    setEditTutorial(null);
    fetchAllTutorials();
  };

  const handleDelete = async (tutorial) => {
    if (!window.confirm(`Delete "${tutorial.title}"?`)) return;
    try {
      await http.delete(`/tutorials/${tutorial._id}`);
      fetchAllTutorials();
    } catch (e) { alert(e.response?.data?.error?.message || e.message); }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">📚 Tutorial Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage experiment tutorials</p>
          </div>
          <Btn color="sky" size="lg" onClick={() => setCreateOpen(true)}>+ New Tutorial</Btn>
        </div>

        {/* Search bar */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Search Tutorials</p>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-lg">🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by tutorial name…"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-gray-50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 text-lg">×</button>
            )}
          </div>
        </Card>

        {err && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-3 text-sm">⚠ {err}</div>}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading tutorials…</p>
          </div>
        ) : tutorials.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">
              {tutorials.length} tutorial{tutorials.length !== 1 ? "s" : ""}
              {searchQuery && <span className="ml-1 text-violet-500">matching "{searchQuery}"</span>}
            </p>
            {tutorials.map(t => (
              <TutorialCard key={t._id} tutorial={t}
                onEdit={setEditTutorial} onDelete={handleDelete}
                onYoutube={setYoutubeTutorial} onViewSteps={loadSteps} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600">No tutorials match "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-sm text-violet-500 underline mt-2">Clear search</button>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📚</p>
            <p className="font-semibold text-gray-500">No tutorials yet — create one above!</p>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="✨ Create Tutorial">
        <TutorialForm
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          experiments={experiments}
          experimentsLoading={experimentsLoading}
          usedExperimentIds={allTutorials.map(t => String(t.externalExperimentId || t.experimentRef?._id || t.experimentRef))}
        />
      </Modal>

      <Modal open={!!editTutorial} onClose={() => setEditTutorial(null)} title="✏️ Edit Tutorial">
        {editTutorial && (
          <TutorialForm
            initial={{ experimentId: editTutorial.externalExperimentId || "", title: editTutorial.title || "", safetyWarnings: editTutorial.safetyWarnings || "", expectedOutcome: editTutorial.expectedOutcome || "", scienceExplanation: editTutorial.scienceExplanation || "", materials: (editTutorial.materials || []).join(", "), steps: editTutorial.steps || [] }}
            onSave={handleEdit}
            onCancel={() => setEditTutorial(null)}
            experiments={experiments}
            experimentsLoading={experimentsLoading}
            usedExperimentIds={allTutorials.map(t => String(t.externalExperimentId || t.experimentRef?._id || t.experimentRef))}
            editingExperimentId={editTutorial.externalExperimentId || editTutorial.experimentRef?._id || editTutorial.experimentRef}
          />
        )}
      </Modal>

      <Modal open={!!youtubeTutorial} onClose={() => setYoutubeTutorial(null)} title="🎬 Attach YouTube Video">
        {youtubeTutorial && <YoutubePanel tutorial={youtubeTutorial} onClose={() => setYoutubeTutorial(null)} onUpdated={() => fetchAllTutorials()} />}
      </Modal>

      <Modal open={!!stepsTutorial} onClose={() => { setStepsTutorial(null); setStepsData(null); }} title="🧪 Tutorial Steps">
        {stepsData && <StepsViewer tutorial={stepsData} />}
      </Modal>
    </div>
  );
}