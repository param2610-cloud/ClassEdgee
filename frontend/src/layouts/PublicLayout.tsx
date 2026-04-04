import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

const PublicLayout = () => {
  const location = useLocation();

  const title = useMemo(() => {
    if (location.pathname === "/auth/login" || location.pathname === "/auth/signin") {
      return "Sign In";
    }

    if (location.pathname === "/auth/register" || location.pathname === "/auth/signup") {
      return "Register";
    }

    return "Welcome";
  }, [location.pathname]);

  usePageTitle(title);

  return <Outlet />;
};

export default PublicLayout;
