import React from 'react';
import { Outlet } from 'react-router-dom';

const StaffLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="Staff-layout">
      {/* Add supreme-specific navigation, header, etc. here */}
      <nav>{/* Staff navigation items */}</nav>
      <main>{children}</main>
      <footer>{/* Staff footer content */}</footer>
    </div>
  );
};

export default StaffLayout;