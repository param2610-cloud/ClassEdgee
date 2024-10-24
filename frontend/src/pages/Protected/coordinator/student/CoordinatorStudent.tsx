import { Button } from '@/components/ui/button'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const CoordinatorStudent = () => {
    const navigate = useNavigate();

  return (
    <div>
      List of Students
      <Button onClick={() => navigate('/p/student/create')}>
        Create Student
      </Button>
    </div>
  )
}

export default CoordinatorStudent
