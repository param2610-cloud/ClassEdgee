import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/AuthContext';
const CoordinatorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {logout} = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsSidebarOpen(false); // Close sidebar after navigation
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className='text-black' size="icon">
              <Menu className="h-4 w-4" color='black' />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            {/* Sidebar content */}
            <nav className="flex flex-col space-y-4 mt-8">
              <Button 
                onClick={() => handleNavigation('/coordinator')} 
                className="text-lg hover:underline"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => handleNavigation('/p/faculty')} 
                className="text-lg hover:underline"
              >
                Teachers
              </Button>
              <Button 
                onClick={() => handleNavigation('/p/student')} 
                className="text-lg hover:underline"
              >
                Students
              </Button>
              <Button 
                onClick={() => handleNavigation('/p/classes')} 
                className="text-lg hover:underline"
              >
                Classes
              </Button>
              <Button 
                onClick={() => handleNavigation('/p/reports')} 
                className="text-lg hover:underline"
              >
                Reports
              </Button>
              <Button 
                onClick={() => handleNavigation('/p/department')} 
                className="text-lg hover:underline"
              >
                Department
              </Button>
              <Button 
                onClick={() => handleNavigation('/p/course')} 
                className="text-lg hover:underline"
              >
                Course
              </Button>
              <Button 
                onClick={logout} 
                className="text-lg hover:underline"
              >
                Log Out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-grow p-4">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 text-center">
        <p>&copy; 2024 Coordinator Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CoordinatorLayout;