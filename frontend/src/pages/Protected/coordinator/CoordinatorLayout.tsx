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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          {hasActiveEmergency ? (
            <AlertFireCoordinator />
          ) : (
            children
          )}
        </div>
      </main>

      
  );
};

export default CoordinatorLayout;