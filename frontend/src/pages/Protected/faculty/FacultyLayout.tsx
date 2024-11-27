import React from 'react';
import { Outlet } from 'react-router-dom';

const FacultyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="Student-layout">
      {/* Add Student-specific navigation, header, etc. here */}
      <nav>{/* Student navigation items */}</nav>
      <main>{children}</main>
      <footer>{/* Student footer content */}</footer>
    </div>
  );
};

export default FacultyLayout;