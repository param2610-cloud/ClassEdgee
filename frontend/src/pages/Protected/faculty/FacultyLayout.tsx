import AlertFire from "@/components/AlertFire";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEmergencyAlert } from "@/hooks/useEmergencyAlert";

const FacultyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasActiveEmergency } = useEmergencyAlert();

  return (
    <div className="relative">
      {hasActiveEmergency ? (
        <AlertFire />
      ) : (
        <SidebarProvider>
          <AppSidebar/>
          <main className="flex-1 p-4 md:p-8">
          {children}
          </main>
        </SidebarProvider>
      )}
    </div>
  );
};
export default FacultyLayout