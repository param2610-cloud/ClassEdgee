import React from 'react'
import { useNavigate } from 'react-router-dom';

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
  }
  return (
    <div>
      Dashboard of Coordinator
      <button onClick={() => navigateTo('/p/faculty/create')}>
        Create Teacher
      </button>
    </div>
  )
}

export default CoordinatorDashboard
