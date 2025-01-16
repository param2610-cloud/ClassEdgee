import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Users, GraduationCap, BookOpen, Building2, Building, BookmarkPlus, AlertTriangle, LogOut, Hand } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/AuthContext';
import { useEmergencyAlert } from '@/hooks/useEmergencyAlert';
import AlertFireCoordinator from './AlertFireForCoordinator';

const NavButton = ({ icon: Icon, label, onClick }) => (
  <Button
    onClick={onClick}
    variant="ghost"
    className="w-full flex items-center gap-3 justify-start text-lg hover:bg-primary/10 transition-colors"
  >
    <Icon className="h-5 w-5" />
    {label}
  </Button>
);

const CoordinatorLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { hasActiveEmergency } = useEmergencyAlert();

  const handleNavigation = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/p/' },
    { icon: Users, label: 'Teachers', path: '/p/faculty' },
    { icon: GraduationCap, label: 'Students', path: '/p/student' },
    { icon: BookOpen, label: 'Classes', path: '/p/classes' },
    { icon: Building2, label: 'Room', path: '/p/rooms' },
    { icon: Building, label: 'Department', path: '/p/department' },
    { icon: BookmarkPlus, label: 'Course', path: '/p/course' },
    { icon: AlertTriangle, label: 'Emergency', path: '/p/emergency' },
    { icon: Hand, label: 'Attendance', path: '/p/attendance' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 bg-primary/5">
                      <h2 className="text-2xl font-semibold text-primary">Navigation</h2>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-6 px-4">
                      <div className="space-y-2">
                        {navItems.map((item) => (
                          <NavButton
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            onClick={() => handleNavigation(item.path)}
                          />
                        ))}
                        <div className="mt-6 pt-6 border-t">
                          <NavButton
                            icon={LogOut}
                            label="Log Out"
                            onClick={logout}
                          />
                        </div>
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {hasActiveEmergency ? (
            <AlertFireCoordinator />
          ) : (
            children
          )}
        </div>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Coordinator Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoordinatorLayout;