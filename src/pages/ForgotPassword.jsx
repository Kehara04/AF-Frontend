import { useState } from "react";
import http from "../api/http";
import Toast from "../components/Toast";
// import logo from "../assets/logo-kids.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await http.post("/auth/forgot-password", { email });
      setMsg({ type: "success", text: "Reset email sent! 📩 Check your inbox." });
    } catch (e2) {
      setMsg({ type: "error", text: e2?.response?.data?.message || "Failed to send reset email" });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8">
        {/* <div className="flex justify-center mb-6">
          <img src={logo} alt="MiniMinds" className="h-20 w-auto object-contain" />
        </div> */}
        <h2 className="text-3xl font-black text-slate-900 text-center">Forgot Password</h2>
        <p className="text-slate-600 mt-1 font-semibold text-center">Enter your email to get a reset link.</p>

        <div className="mt-4">
          <Toast type={msg?.type} text={msg?.text} />
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <label className="block">
            <div className="text-sm font-extrabold text-slate-800 mb-1">Email</div>
            <input
              className="w-full px-4 py-3 rounded-2xl border border-white/50 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all font-semibold text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>

          <button className="w-full py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700">
            Send Reset Link 📩
          </button>
        </form>
      </div>
    </div>
  );
}