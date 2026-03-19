import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export const PublicOnlyRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : <Outlet />;
};