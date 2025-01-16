import AlertFire from '@/components/AlertFire';
import { useEmergencyAlert } from '@/hooks/useEmergencyAlert';
import React from 'react';
import { Outlet } from 'react-router-dom';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasActiveEmergency } = useEmergencyAlert();
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {hasActiveEmergency ? (
        <AlertFire />
      ) : (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default StudentLayout;