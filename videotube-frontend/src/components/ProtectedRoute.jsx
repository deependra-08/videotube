import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader label="Checking your session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
