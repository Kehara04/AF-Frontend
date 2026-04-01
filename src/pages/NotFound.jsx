import { Link } from "react-router-dom";
import bgImage from "../assets/hero.jpg";
import logo from "../assets/logo-kids.png";

export default function NotFound() {
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

          <div className="text-6xl mb-4">🧭</div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Page Not Found
          </h2>
          <p className="mt-3 text-slate-600 font-medium">
            The page you are looking for does not exist, may have been moved, or the link may be incorrect.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="px-6 py-3 rounded-2xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 transition"
            >
              Go Home
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-extrabold hover:bg-slate-200 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}