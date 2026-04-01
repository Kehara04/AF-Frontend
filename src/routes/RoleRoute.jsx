import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowed = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowed.length > 0 && !allowed.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}