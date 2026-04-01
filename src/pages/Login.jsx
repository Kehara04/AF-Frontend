import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
// import logo from "../assets/logo-kids.png";

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [msg, setMsg] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const res = await login({ email, password });
    if (!res.ok) return setMsg({ type: "error", text: res.message });

    const role = res.data?.user?.role;
    nav(role === "admin" ? "/admin" : "/kid");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8">
        {/* <div className="flex justify-center mb-6">
          <img src={logo} alt="MiniMinds" className="h-20 w-auto object-contain" />
        </div> */}
        <h2 className="text-3xl font-black text-slate-900 text-center">Welcome back</h2>
        <p className="text-slate-600 mt-1 font-semibold text-center">Login to continue your science adventure.</p>

        <div className="mt-4">
          <Toast type={msg?.type} text={msg?.text} />
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <Field label="Email">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </Field>

          <Field label="Password">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </Field>

          <button
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {loading && (
            <div className="pt-2">
              <Loader label="Checking your account..." />
            </div>
          )}

          <div className="flex justify-between text-sm font-bold">
            <Link className="text-sky-700 hover:underline" to="/register">
              Create Kid Account
            </Link>
            <Link className="text-slate-700 hover:underline" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-extrabold text-slate-800 mb-1">{label}</div>
      {children}
    </label>
  );
}