import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { LoadingState } from "@/components/ui.jsx";

export function ProtectedRoute({ children, superAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="page-space"><LoadingState label="Checking access…" /></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (superAdmin && user.role !== "Super Admin") return <Navigate to="/admin" replace />;
  return children;
}
