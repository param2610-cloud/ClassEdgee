import { Course, User } from '@/interface/general'
import { domain } from '@/lib/constant'
import { useAuth } from '@/services/AuthContext'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { CourseCard } from '@/components/course/CourseCard'
import { AddCourseDialog } from '@/components/course/AddCourseDialog'

const CourseDashboardForFaculty = () => {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<User | null>(null)
  const [department_id, setDepartmentId] = useState<number>(0)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    fetchFacultyDetails()
  }, [user])

  useEffect(() => {
    if (!department_id && profileData) {
      setDepartmentId(profileData?.departments[0].department_id)
    }
    if (department_id) {
      console.log("department id",department_id);
      
      fetchCourses()
    }
  }, [department_id, profileData])

  const fetchFacultyDetails = async () => {
    const response = await axios.get(`${domain}/api/v1/faculty/get-faculty/${user?.user_id}`)
    const { data } = response.data
    setProfileData(data)
  }

  const fetchCourses = async () => {
    const response = await axios.get(`${domain}/api/v1/curriculum/course/getcourse-by-department-id/${department_id}`)
    const data = response.data
    setCourses(data)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Dashboard</h1>
          {profileData?.departments[0] && <p className="text-black font-bold">{profileData?.departments[0].department_name}</p>}
          <p className="text-gray-600">Manage all college courses and their syllabus</p>
        </div>
        <AddCourseDialog department_id={department_id} onCourseAdded={fetchCourses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>
    </div>
  )
}

export default CourseDashboardForFaculty