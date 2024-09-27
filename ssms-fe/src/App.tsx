import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AttendanceMarking from './components/AttendanceMarking';
import ResourceManagement from './components/ResourceManagement';
import AlertSystem from './components/AlertSystem';
import InteractiveQuiz from './components/InteractiveQuiz';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Chatbot from './components/Chatbot';
import Login from './components/auth/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path='/auth/signin' element={<Login/>}/>
        
        {/* <Route path="/attendance" element={<AttendanceMarking />} />
        <Route path="/resources" element={<ResourceManagement />} />
        <Route path="/alerts" element={<AlertSystem />} />
        <Route path="/quiz" element={<InteractiveQuiz />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/chatbot" element={<Chatbot />} /> */}
      </Routes>
    </Router>
  );
}

export default App;