import { useState } from "react";
import { Link } from "react-router-dom";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
// import logo from "../assets/logo-kids.png";

export default function RegisterKid() {
  const { registerKid, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    grade: "",
    profile_image: null,
  });

  const [msg, setMsg] = useState(null);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    const payload = { ...form, age: form.age === "" ? null : Number(form.age) };
    const res = await registerKid(payload);

    if (!res.ok) return setMsg({ type: "error", text: res.message });

    setMsg({
      type: "success",
      text: "Registered ✅ Please check your email to verify your account 📩",
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8">
        {/* <div className="flex justify-center mb-6">
          <img src={logo} alt="MiniMinds" className="h-20 w-auto object-contain" />
        </div> */}
        <h2 className="text-3xl font-black text-slate-900 text-center">Join the Lab</h2>
        <p className="text-slate-600 mt-1 font-semibold text-center">Create a kid account to start learning.</p>

        <div className="mt-4">
          <Toast type={msg?.type} text={msg?.text} />
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid md:grid-cols-2 gap-4">
          <Field label="Email">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              type="email"
              required
            />
          </Field>

          <Field label="Password">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              type="password"
              required
            />
          </Field>

          <Field label="Name">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Nimal"
            />
          </Field>

          <Field label="Age">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={form.age}
              onChange={(e) => onChange("age", e.target.value)}
              type="number"
              min="3"
              max="18"
              placeholder="10"
            />
          </Field>

          <Field label="Grade">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={form.grade}
              onChange={(e) => onChange("grade", e.target.value)}
              placeholder="5"
            />
          </Field>

          <Field label="Profile Image (optional)">
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 hover:bg-white/90 transition-all text-slate-900 font-semibold"
              type="file"
              accept="image/*"
              onChange={(e) => onChange("profile_image", e.target.files?.[0] || null)}
            />
          </Field>

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            {loading && (
              <div className="pt-2">
                <Loader label="Creating your account..." />
              </div>
            )}

            <div className="text-sm font-semibold text-slate-700 mt-3 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-sky-700 font-extrabold hover:underline">
                Login
              </Link>
            </div>
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