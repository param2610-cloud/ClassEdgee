import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
const CoordinatorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            {/* Sidebar content */}
            <nav className="flex flex-col space-y-4 mt-8">
              <a href="#" className="text-lg hover:underline">Dashboard</a>
              <a href="#" className="text-lg hover:underline">Teachers</a>
              <a href="#" className="text-lg hover:underline">Students</a>
              <a href="#" className="text-lg hover:underline">Classes</a>
              <a href="#" className="text-lg hover:underline">Reports</a>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center">
        <p>&copy; 2024 Coorodinator Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CoordinatorLayout;