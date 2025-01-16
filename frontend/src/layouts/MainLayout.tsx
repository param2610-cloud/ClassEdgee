import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { SidebarProvider, Sidebar } from '../components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Don't show sidebar on these paths
  const noSidebarPaths = ['/', '/auth/signin', '/auth/signup'];
  const shouldShowSidebar = !noSidebarPaths.includes(location.pathname);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AppSidebar 
          className={`${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
