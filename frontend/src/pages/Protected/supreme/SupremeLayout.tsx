import React from "react";
import { useEmergencyAlert } from "@/hooks/useEmergencyAlert";
import AlertFire from "@/components/AlertFire";

const SupremeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasActiveEmergency } = useEmergencyAlert();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {hasActiveEmergency ? (
        <AlertFire />
      ) : (
        <div className="space-y-4">{children}</div>
      )}
    </div>
  );
};

export default SupremeLayout;
