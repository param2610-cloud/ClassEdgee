import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { domain } from '@/lib/constant'

interface AddCourseDialogProps {
  department_id: number
  onCourseAdded: () => void
}

export const AddCourseDialog = ({ department_id, onCourseAdded }: AddCourseDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({
    course_code: "",
    course_name: "",
    credits: "",
    description: "",
    department_id: department_id || 0,
  })

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        ...newCourse,
        credits: Number(newCourse.credits),
        department_id: Number(department_id),
      }
      console.log(courseData);
      
      const response = await fetch(`${domain}/api/v1/curriculum/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      if (response.ok) {
        setIsOpen(false)
        onCourseAdded()
        setNewCourse({
          course_code: "",
          course_name: "",
          credits: "",
          description: "",
          department_id: department_id || 0,
        })
      } else {
        const errorData = await response.json()
        console.error("Error creating course:", errorData)
      }
    } catch (error) {
      console.error("Error creating course:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Enter the details for the new course. Make sure to fill all required fields.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseCode" className="text-right">Course Code *</Label>
            <Input
              id="courseCode"
              value={newCourse.course_code}
              onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseName" className="text-right">Course Name *</Label>
            <Input
              id="courseName"
              value={newCourse.course_name}
              onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="credits" className="text-right">Credits *</Label>
            <Input
              id="credits"
              type="number"
              value={newCourse.credits}
              onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
              className="col-span-3"
              required
              min="0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input
              id="description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateCourse}
            disabled={!newCourse.course_code || !newCourse.course_name || !newCourse.credits || !department_id}
          >
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}