import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Layout from './pages/Protected/Layout';
import Idgenerate from './pages/Protected/supreme/generator/Idgenerate';
import LandingPage from './pages/Open/LandingPage/LandingPage';
import Dashboard from './pages/Protected/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path='/auth/signin' element={<Login/>}/>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/idgenerate" element={<Idgenerate />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;