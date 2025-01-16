import { useEmergencyAlert } from "@/hooks/useEmergencyAlert";
import AlertFireCoordinator from "./AlertFireForCoordinator";
import { ReactNode } from "react";

const CoordinatorLayout = ({ children }: { children: ReactNode }) => {
  const { hasActiveEmergency } = useEmergencyAlert();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {hasActiveEmergency ? (
        <AlertFireCoordinator />
      ) : (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CoordinatorLayout;
