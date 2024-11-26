import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Calendar,
    Clock,
    Users,
    ChevronRight,
    Plus,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Course, SyllabusStructure } from "@/interface/general";
import { domain } from "@/lib/constant";
import axios from "axios";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SpecificCourseDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [syllabi, setSyllabi] = useState<SyllabusStructure[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newSemester,setNewSemester] = useState<string>("");
    const {toast} = useToast()

    useEffect(() => {
        fetchCourseDetails();
        fetchCourseSyllabi();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            const response = await fetch(`${domain}/api/v1/curriculum/course/${id}`);
            const data = await response.json();
            setCourse(data);
        } catch (error) {
            console.error("Error fetching course details:", error);
        }
    };

    const fetchCourseSyllabi = async () => {
        try {
            const response = await fetch(`${domain}/api/v1/curriculum/syllabus/${id}`);
            const data = await response.json();
            setSyllabi(data);
        } catch (error) {
            console.error("Error fetching syllabi:", error);
        }
    };

    if (!course) {
        return <div className="container mx-auto p-6">Loading...</div>;
    }
    
    const SemesterCreate =async ()=>{
        try {
            const response  =await axios.post(`${domain}/api/v1/curriculum/syllabus/${id}`,{
                semester:parseInt(newSemester)
            });
            
            console.log(response);
            if(response.status === 201){
                fetchCourseSyllabi();
            }else{
                toast({
                    title: "Error",
                    description: "Failed to create Semester",
                    variant: "destructive"
                })
            }
            
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="container mx-auto p-6">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/p/course">Courses</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{course.course_name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            {course.course_name}
                        </CardTitle>
                        <CardDescription>{course.course_code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{course.credits} Credits</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{syllabi.length} Semesters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>
                                    Department:{" "}
                                    {course.departments?.department_name}
                                </span>
                            </div>
                        </div>
                        <p className="mt-4 text-gray-600">
                            {course.description}
                        </p>
                    </CardContent>
                </Card>

                <Tabs defaultValue="syllabus" className="w-full">
                    <TabsList>
                        <TabsTrigger value="syllabus">
                            Syllabus Structure
                        </TabsTrigger>
                        <TabsTrigger value="overview">
                            Course Overview
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="syllabus">
                        <div className="grid gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">
                                    Semester-wise Syllabus
                                </h3>
                                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <DialogTrigger asChild>
                                
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Semester
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Semester</DialogTitle>
                        </DialogHeader>
                            <Label>Semester</Label>
                            <Input onChange={(e) => setNewSemester(e.target.value)}/>
                        <DialogFooter>
                            <Button 
                                onClick={SemesterCreate}
                                disabled={
                                    newSemester===""
                                }
                            >
                                Create Course
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {syllabi.map((syllabus: SyllabusStructure) => (
                                    <Card
                                        key={syllabus.syllabus_id}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() =>
                                            navigate(
                                                `/p/course/${id}/semester/${syllabus.semester}/${syllabus.syllabus_id}`
                                            )
                                        }
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                Semester {syllabus.semester}
                                            </CardTitle>
                                            <CardDescription>
                                                {syllabus.subject_details.length || 0}{" "}
                                                Subjects
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Click to view or manage semester
                                                syllabus
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Overview</CardTitle>
                                <CardDescription>
                                    Detailed information about the course
                                    structure and objectives
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold">
                                            Learning Outcomes
                                        </h4>
                                        <ul className="list-disc list-inside mt-2">
                                            {course.learning_outcomes?.map(
                                                (outcome, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-gray-600"
                                                    >
                                                        {outcome}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">
                                            Prerequisites
                                        </h4>
                                        <p className="text-gray-600 mt-2">
                                            {course.prerequisites ||
                                                "No prerequisites specified"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SpecificCourseDashboard;
