import AlertFire from '@/components/AlertFire';
import { useEmergencyAlert } from '@/hooks/useEmergencyAlert';
import React from 'react';
import { Outlet } from 'react-router-dom';

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { hasActiveEmergency } = useEmergencyAlert();
  
  return (
    <div className="Student-layout">
      {/* Add Student-specific navigation, header, etc. here */}
      <nav>{/* Student navigation items */}</nav>
      <main>{hasActiveEmergency ? (
            <AlertFire />
          ) : (
            <>
              {children}
            </>
          )}</main>
      <footer>{/* Student footer content */}</footer>
    </div>
  );
};

export default StudentLayout;