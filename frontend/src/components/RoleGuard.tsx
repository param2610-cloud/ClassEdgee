import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/hooks/useAuth";
import { AuthRole } from "@/store/auth.store";

interface RoleGuardProps {
  expectedRole: AuthRole;
}

const roleHomeMap: Record<AuthRole, string> = {
  admin: "/admin",
  coordinator: "/coordinator",
  faculty: "/faculty",
  student: "/student",
};

const RoleGuard = ({ expectedRole }: RoleGuardProps) => {
  const location = useLocation();
  const { token, user, isHydrated } = useAuth();
  const { isLoading } = useCurrentUser();

  if (!isHydrated) {
    return <div className="p-6 text-sm text-muted-foreground">Loading session...</div>;
  }

  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  const activeUser = user;

  if (isLoading && !activeUser) {
    return <div className="p-6 text-sm text-muted-foreground">Validating access...</div>;
  }

  if (!activeUser) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (activeUser.role !== expectedRole) {
    const safeRedirect = roleHomeMap[activeUser.role] || "/auth/login";
    return <Navigate to={safeRedirect} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
