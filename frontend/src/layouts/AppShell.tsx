import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
import { NavItem } from "@/lib/navigation";

interface AppShellProps {
  nav: NavItem[];
  children: ReactNode;
}

const AppShell = ({ nav, children }: AppShellProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const emergency = useEmergency();

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
