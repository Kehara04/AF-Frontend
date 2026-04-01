import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-kids.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const goDashboard = () => {
    if (!user) return nav("/login");
    nav(user.role === "admin" ? "/admin" : "/kid");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="MiniMinds" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-1 text-sm font-bold">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? "bg-sky-600 text-white shadow-md shadow-sky-200" : "text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200"
              }`
            }
          >
            Home
          </NavLink>

          <a
            href="/#about"
            className="px-3 py-2 rounded-xl text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200 transition-all duration-200"
          >
            About
          </a>

          {!user ? (
            <>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? "bg-sky-600 text-white shadow-md shadow-sky-200" : "text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200"
                  }`
                }
              >
                Register
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? "bg-sky-600 text-white shadow-md shadow-sky-200" : "text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200"
                  }`
                }
              >
                Login
              </NavLink>
            </>
          ) : (
            <>
              <button
                onClick={goDashboard}
                className="px-3 py-2 rounded-xl text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200 transition-all duration-200"
              >
                Dashboard
              </button>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? "bg-sky-600 text-white shadow-md shadow-sky-200" : "text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200"
                  }`
                }
              >
                Profile
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="px-3 py-2 rounded-xl text-slate-700 hover:bg-sky-600 hover:text-white hover:shadow-md hover:shadow-sky-200 transition-all duration-200"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}