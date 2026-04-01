import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import http from "../api/http";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import logo from "../assets/logo-kids.png";
import bgImage from "../assets/hero.jpg";

export default function VerifyEmail() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "info", text: "Verifying your email..." });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await http.get(`/auth/verify/${token}`);
        if (!mounted) return;
        setMsg({
          type: "success",
          text: "Email verified successfully ✅ You can login now.",
        });
      } catch (e) {
        if (!mounted) return;
        setMsg({
          type: "error",
          text: e?.response?.data?.message || "Invalid or expired token",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div
      className="min-h-screen rounded-[32px] overflow-hidden border border-slate-200 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-white/70 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white/92 backdrop-blur-md border border-white/70 shadow-xl rounded-[32px] p-8 md:p-10 text-center">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="MiniMinds" className="h-20 w-auto object-contain" />
          </div>

          <div className="text-5xl mb-4">📩</div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Email Verification
          </h2>
          <p className="text-slate-600 mt-2 font-medium">
            We are checking your verification link and updating your account.
          </p>

          <div className="mt-6">
            {loading ? <Loader label="Verifying..." /> : <Toast type={msg.type} text={msg.text} />}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
            >
              Go to Login →
            </Link>

            <Link
              to="/"
              className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}