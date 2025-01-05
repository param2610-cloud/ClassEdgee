import React from 'react'
import FacultyExpertiseManager from './FacultyExpertiseManager'
import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'

const SubjectAssignment = () => {
    const navigate = useNavigate()
    const {course_id,semester_id,syllabus_id} = useParams()
  return (
    <div>
        <FacultyExpertiseManager/>
        <Button onClick={()=>    navigate(`/p/schedule/course/${course_id}/semester/${semester_id}/${syllabus_id}/generate-schedule`)}>
            Next Step
        </Button>
    </div>
  )
}

export default SubjectAssignment