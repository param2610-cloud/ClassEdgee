import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, School } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Course, Department } from "@/interface/general";
import { domain } from "@/lib/constant";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";

const CourseDashboard = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [institution_id] = useAtom(institutionIdAtom)
    const [newCourse, setNewCourse] = useState({
        course_code: "",
        course_name: "",
        credits: "",
        description: "",
        department_id: 0,
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
        // fetchDepartments();
    }, []);


 
    const fetchCourses = async () => {
        try {
            const response = await fetch(`${domain}/api/v1/curriculum/course`);
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleCreateCourse = async () => {
        try {
            // Convert credits and department_id to numbers
            const courseData = {
                ...newCourse,
                credits: Number(newCourse.credits),
                department_id: Number(newCourse.department_id),
            };

            const response = await fetch(`${domain}/api/v1/curriculum/course`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(courseData),
            });

            if (response.ok) {
                setIsAddDialogOpen(false);
                fetchCourses();
                // Reset form
                setNewCourse({
                    course_code: "",
                    course_name: "",
                    credits: "",
                    description: "",
                    department_id: 0,
                });
            } else {
                const errorData = await response.json();
                console.error("Error creating course:", errorData);
                // Here you could add error handling UI feedback
            }
        } catch (error) {
            console.error("Error creating course:", error);
            // Here you could add error handling UI feedback
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Course Dashboard</h1>
                    <p className="text-gray-600">
                        Manage all college courses and their syllabus
                    </p>
                </div>
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
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
                                Enter the details for the new course. Make sure
                                to fill all required fields.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="courseCode"
                                    className="text-right"
                                >
                                    Course Code *
                                </Label>
                                <Input
                                    id="courseCode"
                                    value={newCourse.course_code}
                                    onChange={(e) =>
                                        setNewCourse({
                                            ...newCourse,
                                            course_code: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="courseName"
                                    className="text-right"
                                >
                                    Course Name *
                                </Label>
                                <Input
                                    id="courseName"
                                    value={newCourse.course_name}
                                    onChange={(e) =>
                                        setNewCourse({
                                            ...newCourse,
                                            course_name: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="credits" className="text-right">
                                    Credits *
                                </Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    value={newCourse.credits}
                                    onChange={(e) =>
                                        setNewCourse({
                                            ...newCourse,
                                            credits: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="department" className="text-right">
                                    Department *
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={newCourse.department_id.toString()}
                                        onValueChange={(value) =>
                                            setNewCourse({
                                                ...newCourse,
                                                department_id: parseInt(value),
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.department_id}
                                                    value={dept.department_id.toString()}
                                                >
                                                    {dept.department_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="description"
                                    className="text-right"
                                >
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    value={newCourse.description}
                                    onChange={(e) =>
                                        setNewCourse({
                                            ...newCourse,
                                            description: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                onClick={handleCreateCourse}
                                disabled={
                                    !newCourse.course_code ||
                                    !newCourse.course_name ||
                                    !newCourse.credits ||
                                    !newCourse.department_id
                                }
                            >
                                Create Course
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card
                        key={course.course_id}
                        className="hover:shadow-lg transition-shadow"
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {course.course_name}
                            </CardTitle>
                            <CardDescription>
                                {course.course_code}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                {course.description}
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <School className="h-4 w-4" />
                                <span className="text-sm">
                                    {course.credits} Credits
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(`/p/course/${course.course_id}`)
                                }
                            >
                                View Details
                            </Button>
                            <Button
                                onClick={() =>
                                    navigate(
                                        `/course/${course.course_id}/stream/create`
                                    )
                                }
                            >
                                Manage Syllabus
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CourseDashboard;