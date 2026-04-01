import { createContext, useContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  const setSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) localStorage.setItem("token", newToken);
    else localStorage.removeItem("token");

    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));
    else localStorage.removeItem("user");
  };

  const logout = () => setSession(null, null);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await http.post("/auth/login", { email, password });
      setSession(res.data.token, res.data.user);
      return { ok: true, data: res.data };
    } catch (e) {
      return { ok: false, message: e?.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const registerKid = async (payload) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("email", payload.email);
      form.append("password", payload.password);
      form.append("name", payload.name || "");
      form.append("age", payload.age ?? "");
      form.append("grade", payload.grade || "");
      if (payload.profile_image) form.append("profile_image", payload.profile_image);

      const res = await http.post("/auth/register-kid", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { ok: true, data: res.data };
    } catch (e) {
      return { ok: false, message: e?.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await http.get("/auth/me");
      // keep same shape as login response user
      const newUser = {
        mongo_id: res.data.mongo_id,
        user_id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        isVerified: res.data.isVerified,
      };
      setSession(localStorage.getItem("token"), newUser);
    } catch {
      // token invalid/expired
      logout();
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, login, registerKid, logout, fetchMe }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);