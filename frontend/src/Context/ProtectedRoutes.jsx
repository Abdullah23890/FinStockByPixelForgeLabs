import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoutes({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    
    return <div style={{ padding: 40, textAlign: "center", color: "#6B7590" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}