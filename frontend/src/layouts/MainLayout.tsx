import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../components/app-sidebar';
import { Separator } from '../components/ui/separator';
import { BreadcrumbNav } from '../components/BreadcrumbNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();
  const location = useLocation();

  const noSidebarPaths = ['/', '/auth/signin', '/auth/signup'];
  const shouldShowSidebar = !noSidebarPaths.includes(location.pathname);

  if (!shouldShowSidebar) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <SidebarProvider defaultOpen={true} className='w-full h-full'>
      <div className="flex min-h-screen w-full h-full">
        <AppSidebar className={`${isLoading ? 'pointer-events-none opacity-50' : ''}`} />
        <div className="flex flex-1 flex-col">
          <header className="overflow-hidden sticky top-0  flex h-16 shrink-0 items-center border-b bg-background">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbNav />
            </div>
          </header>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
