import { ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import BreadcrumbNav from "@/components/shared/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { logout } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { useEmergency } from "@/hooks/useEmergency";
import { usePageTitle } from "@/hooks/usePageTitle";
import { NavItem } from "@/lib/navigation";

interface AppShellProps {
  nav: NavItem[];
  children: ReactNode;
}

const AppShell = ({ nav, children }: AppShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const emergency = useEmergency();

  const pageTitle = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const role = segments[0] || "app";
    const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

    if (segments.length <= 1) {
      return `${roleTitle} Dashboard`;
    }

    if (segments[1] === "classes" && segments[2]) {
      return `${roleTitle} Class Room`;
    }

    if (segments[1] === "profile") {
      return `${roleTitle} Profile`;
    }

    const sectionTitle = segments[1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return `${roleTitle} ${sectionTitle}`;
  }, [location.pathname]);

  usePageTitle(pageTitle);

  const displayName =
    user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "User";

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar nav={nav} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <div className="flex-1">
            <BreadcrumbNav />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {displayName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {emergency.isActive && (
          <div className="border-b border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {emergency.message}
          </div>
        )}

        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;
