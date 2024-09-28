import React from 'react';
import { Outlet } from 'react-router-dom';

import { useContext } from 'react';
import { useAuth } from '@/services/AuthContext';

const SupremeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth()

  return (
    <div className="supreme-layout">
      {/* Add supreme-specific navigation, header, etc. here */}
      <nav>
        <button onClick={logout}>Logout</button>
      </nav>
      <main>{children}</main>
      <footer>{/* Supreme footer content */}</footer>
    </div>
  );
};

export default SupremeLayout;
