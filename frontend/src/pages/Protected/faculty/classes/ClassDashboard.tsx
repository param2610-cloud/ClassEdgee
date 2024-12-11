import React, { useState, useEffect } from "react";
import {
    Download,
    File,
    BookOpen,
    ClipboardList,
    Users,
    Clock,
    MessageCircle,
    VideoIcon,
    Bell,
    Activity,
    BarChart2,
    Calendar,
    CheckCircle,
    FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/services/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { domain, fastapidomain } from "@/lib/constant";
import { Class, SyllabusStructure } from "@/interface/general";
import ResourcesTab from "./resource/Resource";
import NotesTab from "./notes/Notes";
import QuerySystem from "../../query/QuerySystem";
//import QuizDashboard from "./resource/QuizDashboard";

const ClassDashboard = () => {
    const {class_id}= useParams()
    const [classData,setClassData] = useState<Class | null>(null);
    const navigate = useNavigate();
    const [syllabus, setSyllabus] = useState<SyllabusStructure | null>(null)
    const {user} = useAuth()
    useEffect(()=>{
        if(classData?.schedule_details.subject_details?.syllabus_structure){
            setSyllabus(classData.schedule_details.subject_details.syllabus_structure)
        }
    },[classData])

    const [resources, setResources] = useState([
        {
            id: 1,
            name: "Lecture Slides",
            type: "pdf",
            size: "5.2 MB",
            uploadDate: "2024-03-15",
            description: "Comprehensive slides covering OOP concepts",
        },
        {
            id: 2,
            name: "Assignment Guidelines",
            type: "docx",
            size: "2.1 MB",
            uploadDate: "2024-03-10",
            description: "Detailed instructions for semester project",
        },
    ]);

    const [assignments, setAssignments] = useState([
        {
            id: 1,
            title: "Design Patterns Implementation",
            deadline: "2024-04-05",
            status: "In Progress",
            progress: 60,
            maxScore: 100,
        },
        {
            id: 2,
            title: "Advanced Algorithms Analysis",
            deadline: "2024-04-20",
            status: "Not Started",
            progress: 0,
            maxScore: 100,
        },
    ]);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "Assignment",
            message: "New assignment uploaded: Design Patterns",
            date: "2024-03-18",
        },
        {
            id: 2,
            type: "Class",
            message: "Next lecture on Advanced Programming postponed",
            date: "2024-03-17",
        },
    ]);

    const [quizModal, setQuizModal] = useState(false);

    const handleQuizStart = () => {
        setQuizModal(true);
        navigate('p/classes/:class_id/quiz');

    };
    useEffect(()=>{
        const fetchClassDetails = async ()=> {
            const response = await axios.get(`${domain}/api/v1/classes/${class_id}`)
            console.log(response.data)
            setClassData(response.data)
        }
        if(class_id && !classData){
            fetchClassDetails()
            
        }
    },[class_id,classData])

    const handleResourceDownload = (resource:any) => {
        alert(`Downloading ${resource.name}`);
    };
    const [attendancetaking, setAttendanceTaking] = useState(false);
    const handleTakingAttendance = () => {
        try {
            if(attendancetaking){
                const response = axios.post(`${fastapidomain}/api/face-recognition/stop-attendance/${classData?.section_id}/${class_id}`)
                if(response.status === 200){
                    setAttendanceTaking(false)
                    console.log("Attendance stopped");
                }
            }else{
                const response = axios.post(`${fastapidomain}/api/face-recognition/start-attendance/${classData?.section_id}/${class_id}`)
                if(response.status === 200){
                    setAttendanceTaking(true)
                    console.log("Attendance started");
                }
        }
        } catch (error) {
            console.error('Error taking attendance:', error);
        }   
    }

    return (
        <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-md">
            {/* Room Header */}
            <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-800">
                            Virtual Classroom: {classData?.courses?.course_name}
                        </h1>
                        <div className="text-sm text-gray-600 mt-2">
                            <p className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                Batch: {classData?.sections?.batch_year} | Stream:{" "}
                                {classData?.sections?.departments?.department_name}
                            </p>
                            <p className="flex items-center">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Section: {classData?.sections?.section_name} | Semester:{" "}
                                {classData?.semester}
                            </p>
                            <p className="flex items-center">
                                <VideoIcon className="mr-2 h-4 w-4" />
                                Faculty: {classData?.faculty?.users?.first_name}{" "}
                                {classData?.faculty?.users?.last_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Button className="bg-green-500 hover:bg-green-600" onClick={handleTakingAttendance}>
                            <VideoIcon className="mr-2 h-5 w-5" />
                            Take Attendance
                        </Button>
                        <Button variant="outline" className="bg-blue-100 hover:bg-blue-200"
                        onClick={() => navigate(`/p/classes/${class_id}/quiz`)} >
                        
                            <Clock className="mr-2 h-5 w-5" />
                            Create Quiz
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="resources" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="resources">
                        <File className="mr-2 h-4 w-4" />
                        Resources
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Notes
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Assignments
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="query">
                        <FileQuestion className="mr-2 h-4 w-4" />
                        Query
                    </TabsTrigger>
                </TabsList>

                {/* Resources Tab */}
                <TabsContent value="resources">
                    <ResourcesTab courseId={Number(class_id)} />
                </TabsContent>

                <TabsContent value="notes">
                    <NotesTab courseId={Number(class_id)} />
                </TabsContent>


                {/* Assignments Tab */}
                <TabsContent value="assignments">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-6 w-6" />
                                Current Assignments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="p-3 bg-gray-100 rounded-lg mb-2"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="font-medium">
                                                {assignment.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                <Calendar className="inline mr-1 h-4 w-4" />
                                                Deadline: {assignment.deadline}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-sm font-semibold ${
                                                assignment.status ===
                                                "In Progress"
                                                    ? "text-yellow-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {assignment.status}
                                        </span>
                                    </div>
                                    <Progress
                                        value={assignment.progress}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="mr-2 h-6 w-6" />
                                Recent Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-3 bg-gray-100 rounded-lg mb-2 flex items-center"
                                >
                                    <div className="mr-3">
                                        {notification.type === "Assignment" ? (
                                            <ClipboardList className="h-6 w-6 text-blue-500" />
                                        ) : (
                                            <VideoIcon className="h-6 w-6 text-green-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {notification.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart2 className="mr-2 h-6 w-6" />
                                Academic Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Overall Grades
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p>Current GPA: 3.7</p>
                                            <Progress
                                                value={74}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <p>Semester Progress: 65%</p>
                                            <Progress
                                                value={65}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Recent Assessments
                                    </h3>
                                    <ul className="space-y-1">
                                        <li>Midterm Exam: A (92%)</li>
                                        <li>Coding Assignment: B+ (88%)</li>
                                        <li>Quiz 2: A- (90%)</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="query">
                    {user && classData?.faculty_id && <QuerySystem userId={user?.user_id} userRole="faculty" facultyId={classData?.faculty_id}  />}
                </TabsContent>
            </Tabs>

            {/* Quiz Modal */}
            <Dialog open={quizModal} onOpenChange={setQuizModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Start Quiz: Advanced Programming Concepts
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Quiz Details:</p>
                        <ul className="list-disc pl-5">
                            <li>Total Questions: 20</li>
                            <li>Time Limit: 30 minutes</li>
                            <li>Passing Score: 70%</li>
                        </ul>
                        <Button
                            className="w-full bg-green-500 hover:bg-green-600"
                            onClick={() => alert("Quiz Started!")}
                        >
                            Confirm and Start Quiz
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClassDashboard;
