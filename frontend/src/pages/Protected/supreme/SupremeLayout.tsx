import React from "react";
import { Outlet } from "react-router-dom";

import { useContext } from "react";
import { useAuth } from "@/services/AuthContext";
import { useEmergencyAlert } from "@/hooks/useEmergencyAlert";
import AlertFire from "@/components/AlertFire";

const SupremeLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout } = useAuth();
  const { hasActiveEmergency } = useEmergencyAlert();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Add supreme-specific navigation, header, etc. here */}
      <nav className="flex items-center justify-between p-4">
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={logout}
        >
          Logout
        </button>
      </nav>
      <main className="flex-1">
        <div className="relative">
          {hasActiveEmergency ? (
            <AlertFire />
          ) : (
            <>
              {children}
            </>
          )}
        </div>
      </main>
      <footer className="p-4">{/* Supreme footer content */}</footer>
    </div>
  );
};

export default SupremeLayout;
