import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import http from "../api/http";
import Toast from "../components/Toast";
import bgImage from "../assets/hero.jpg";
import logo from "../assets/logo-kids.png";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (password.length < 6) {
      return setMsg({
        type: "error",
        text: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return setMsg({
        type: "error",
        text: "Passwords do not match",
      });
    }

    try {
      setSaving(true);
      await http.post(`/auth/reset-password/${token}`, { password });
      setMsg({
        type: "success",
        text: "Password reset successful ✅ Now login with your new password.",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (e2) {
      setMsg({
        type: "error",
        text: e2?.response?.data?.message || "Invalid or expired token",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="MiniMinds" className="h-20 w-auto object-contain" />
          </div>

          <div className="text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Reset Password
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Enter a new password for your account and confirm it below.
            </p>
          </div>

          <div className="mt-6">
            <Toast type={msg?.type} text={msg?.text} />
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <label className="block">
              <div className="text-sm font-extrabold text-slate-800 mb-2">
                New Password
              </div>
              <input
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 font-semibold text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter new password"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-extrabold text-slate-800 mb-2">
                Confirm Password
              </div>
              <input
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 font-semibold text-slate-900"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Confirm new password"
                required
              />
            </label>

            <button
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 disabled:opacity-60 transition"
            >
              {saving ? "Resetting..." : "Reset Password ✅"}
            </button>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
              >
                Back to Login
              </Link>

              <Link
                to="/"
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black transition"
              >
                Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}