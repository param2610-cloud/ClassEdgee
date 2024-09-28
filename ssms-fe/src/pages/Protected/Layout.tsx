// src/components/Layout.jsx
import { useAuth } from '@/services/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
// import Header from './Header';

function Layout() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <main className="flex-grow mt-16">
        <Outlet/>
      </main>
    </div>
  );
}

export default Layout;