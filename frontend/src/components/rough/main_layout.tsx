import React, { useMemo } from 'react';
import { useAuth } from '@/services/AuthContext';
import SupremeLayout from '@/pages/Protected/supreme/SupremeLayout';
import FacultyLayout from '@/pages/Protected/faculty/FacultyLayout';
import CoordinatorLayout from '@/pages/Protected/coordinator/CoordinatorLayout';
import StudentLayout from '@/pages/Protected/student/StudentLayout';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const Layout = useMemo(() => {
    switch (user?.role) {
      case "admin":
        return SupremeLayout;
      case "faculty":
        return FacultyLayout;
      case "coordinator":
        return CoordinatorLayout;
      case "student":
        return StudentLayout;
      default:
        return ({ children }: { children: React.ReactNode }) => <>{children}</>;
    }
  }, [user?.role]);

  return <Layout>{children}</Layout>;
};

export default React.memo(MainLayout);