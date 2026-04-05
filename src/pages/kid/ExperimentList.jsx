import { useEffect, useState } from "react";
import http from "../../api/http";
import { useNavigate } from "react-router-dom";

export default function ExperimentList() {
  const [experiments, setExperiments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    const res = await http.get("/experiments");
    setExperiments(res.data);
  };

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
      <h2 className="text-2xl font-black text-slate-900 mb-4">Available Experiments 🧪</h2>

      {experiments.map((exp) => (
        <div
          key={exp.experiment_id}
          className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl p-4 mb-3 flex gap-4 shadow-sm hover:bg-white/40 transition"
        >
          {exp.image && (
            <img 
              src={`http://localhost:5000/uploads/${exp.image}`} 
              alt={exp.title} 
              className="w-32 h-32 object-cover rounded-lg flex-shrink-0" 
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900">{exp.title}</h3>
            <p className="text-slate-700 mb-2">{exp.description}</p>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Age Group:</strong> {exp.ageGroup}</p>
              <p><strong>Difficulty:</strong> {exp.difficulty}</p>
              <p><strong>Duration:</strong> {exp.duration}</p>
            </div>

            <div className="mt-3 flex gap-3">
              <button
                onClick={() => navigate(`/place-order/${exp.experiment_id}`)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold px-4 py-2 text-sm rounded-full shadow-xl shadow-cyan-300/40 transform transition-all duration-200 hover:scale-105 hover:shadow-cyan-400/40 hover:-translate-y-0.5"
              >
                🛒 Order Kit
              </button>
              <button
                onClick={() => navigate(`/kid/tutorials/experiment/${exp.experiment_id || exp._id}`)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold px-4 py-2 text-sm rounded-full shadow-xl shadow-fuchsia-300/40 transform transition-all duration-200 hover:scale-105 hover:shadow-fuchsia-400/40 hover:-translate-y-0.5"
              >
                ▶️ Start Tutorial
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
