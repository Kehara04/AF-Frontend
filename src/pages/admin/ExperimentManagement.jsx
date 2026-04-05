import { useEffect, useState } from "react";
import http from "../../api/http";

export default function ExperimentManagement() {
  const [experiments, setExperiments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    ageGroup: "",
    tools: "",
    price: "",
    difficulty: "Beginner",
    duration: "30 minutes",
  });
  const [image, setImage] = useState(null);

  const fetchExperiments = async () => {
    const res = await http.get("/experiments");
    setExperiments(res.data);
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('ageGroup', form.ageGroup);
    formData.append('tools', JSON.stringify(form.tools.split(",").map((t) => t.trim())));
    formData.append('price', form.price);
    formData.append('difficulty', form.difficulty);
    formData.append('duration', form.duration);
    if (image) {
      formData.append('image', image);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (editingId) {
      await http.put(`/experiments/${editingId}`, formData, config);
      window.alert("Experiment updated successfully! 🎉");
    } else {
      await http.post("/experiments", formData, config);
      window.alert("Experiment added successfully! 🎉");
    }

    setForm({ title: "", description: "", ageGroup: "", tools: "", price: "", difficulty: "Beginner", duration: "30 minutes" });
    setImage(null);
    setEditingId(null);
    fetchExperiments();
  };

  const handleEdit = (exp) => {
    setEditingId(exp.experiment_id);
    setForm({
      title: exp.title,
      description: exp.description,
      ageGroup: exp.ageGroup,
      tools: exp.tools.join(", "),
      price: exp.price || "",
      difficulty: exp.difficulty || "Beginner",
      duration: exp.duration || "30 minutes",
    });
    setImage(null); // Reset image for editing
  };

  const handleDelete = async (id) => {
    await http.delete(`/experiments/${id}`);
    window.alert("Experiment deleted successfully! 🗑️");
    fetchExperiments();
  };

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
      <h2 className="text-2xl font-black text-slate-900 mb-4">Manage Experiments 🧪</h2>

      <div className="grid gap-3 mb-6 bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl p-4">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />
        <input name="ageGroup" placeholder="Age Group" value={form.ageGroup} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />
        <input name="tools" placeholder="Tools (comma separated)" value={form.tools} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />
        <select name="difficulty" value={form.difficulty} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <input name="duration" placeholder="Duration (e.g., 30 minutes)" value={form.duration} onChange={handleChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />
        <input type="file" accept="image/*" onChange={handleImageChange} className="border border-white/60 bg-white/70 p-2 rounded-xl" />

        <button onClick={handleSubmit} className="bg-sky-600 text-white p-2 rounded-xl font-bold hover:bg-sky-700 transition-colors">
          {editingId ? "Update Experiment" : "Add Experiment"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {experiments.map((exp) => (
          <div key={exp.experiment_id} className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="relative h-44 bg-gradient-to-br from-blue-100 to-indigo-100">
              {exp.image ? (
                <img
                  src={`http://localhost:5000/uploads/${exp.image}`}
                  alt={exp.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl opacity-30">🧪</div>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  exp.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                  exp.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {exp.difficulty}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{exp.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{exp.description}</p>

              <div className="text-xs text-gray-500 space-y-1 mb-3">
                <p><strong>Age:</strong> {exp.ageGroup}</p>
                <p><strong>Duration:</strong> {exp.duration}</p>
                <p><strong>Price:</strong> LKR {Number(exp.price).toFixed(2)}</p>
                <p><strong>Tools:</strong> {exp.tools.join(', ')}</p>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(exp)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 shadow-sm transition-colors duration-200"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(exp.experiment_id)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 shadow-sm transition-colors duration-200"
                  title="Delete"
                >
                  🗑️
                </button>
                {editingId === exp.experiment_id && (
                  <button
                    onClick={handleSubmit}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm transition-colors duration-200"
                    title="Update"
                  >
                    ✅
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
