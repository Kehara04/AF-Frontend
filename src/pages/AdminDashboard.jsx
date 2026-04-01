import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
        <h2 className="text-3xl font-black text-slate-900">Admin Dashboard 👑</h2>
        <p className="text-slate-600 mt-1 font-semibold">
          Manage kids, experiments, feedback and system data.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminCard title="Kids Management" emoji="🧒" text="View kids, activate/deactivate accounts." to="/admin/kids" color="sky" />
          <AdminCard title="Experiments" emoji="🧪" text="Create, update and delete experiments." to="/admin/experiments" color="emerald" />
          <AdminCard title="Tutorials" emoji="🎥" text="Manage experiment tutorials." to="/admin/tutorials" color="violet" />
          <AdminCard title="Manage Quizzes" emoji="🧩" text="Create, update and delete quizzes." to="/admin/quizzes/manage" color="fuchsia" />
          <AdminCard title="Quiz Results" emoji="📊" text="View quiz results by experiment." to="/admin/quizzes/results" color="amber" />
          <AdminCard title="Orders" emoji="📦" text="Check and manage orders by experiment." to="/admin/orders" color="orange" />
          <AdminCard title="Feedback" emoji="💬" text="View all kids' feedback, delete if needed." to="/admin/feedback" color="rose" />
          <AdminCard title="Progress & Badges" emoji="🏅" text="Track kids' experiment progress and badges." to="/admin/progress" color="teal" />
        </div>
      </div>
    </div>
  );
}

const COLOR_MAP = {
  sky: { hover: "group-hover:text-sky-700", dot: "bg-sky-500" },
  emerald: { hover: "group-hover:text-emerald-700", dot: "bg-emerald-500" },
  violet: { hover: "group-hover:text-violet-700", dot: "bg-violet-500" },
  fuchsia: { hover: "group-hover:text-fuchsia-700", dot: "bg-fuchsia-500" },
  amber: { hover: "group-hover:text-amber-700", dot: "bg-amber-500" },
  orange: { hover: "group-hover:text-orange-700", dot: "bg-orange-500" },
  rose: { hover: "group-hover:text-rose-700", dot: "bg-rose-500" },
  teal: { hover: "group-hover:text-teal-700", dot: "bg-teal-500" },
};

function AdminCard({ title, emoji, text, to, color = "sky" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.sky;
  return (
    <Link to={to} className="group bg-white/30 backdrop-blur-sm border border-white/40 rounded-3xl p-5 hover:bg-white/50 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{emoji}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${c.dot} opacity-70`} />
      </div>
      <div className={`text-lg font-black text-slate-900 ${c.hover} transition-colors`}>{title}</div>
      <div className="mt-1 text-slate-500 font-medium text-sm">{text}</div>
    </Link>
  );
}