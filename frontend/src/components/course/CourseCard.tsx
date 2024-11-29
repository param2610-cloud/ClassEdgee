import { Course } from '@/interface/general'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, School } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CourseCardProps {
  course: Course
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate()

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {course.course_name}
        </CardTitle>
        <CardDescription>{course.course_code}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{course.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <School className="h-4 w-4" />
          <span className="text-sm">{course.credits} Credits</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(`/p/course/${course.course_id}`)}>
          View Details
        </Button>
        <Button onClick={() => navigate(`/course/${course.course_id}/stream/create`)}>
          Manage Syllabus
        </Button>
      </CardFooter>
    </Card>
  )
}