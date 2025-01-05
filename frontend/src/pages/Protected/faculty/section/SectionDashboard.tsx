import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { Section, Student } from "@/interface/general";
import { domain } from "@/lib/constant";

const SectionDashboard: React.FC = () => {
    const { section_id } = useParams<{ section_id: string }>();
    const [sectionDetails, setSectionDetails] = useState<Section | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [sectionStudents, setSectionStudents] = useState<Student[]>([]);
    const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (section_id) {
                await fetchSectionDetails();
            }
        };
        fetchData();
    }, [section_id]);

    useEffect(() => {
        if (sectionDetails) {
            setSectionStudents(sectionDetails.students);
        }
    }, [sectionDetails]);

    const fetchSectionDetails = async () => {
        try {
            const response = await axios.get(
                `${domain}/api/v1/section/${section_id}`
            );
            setSectionDetails(response.data.data);
        } catch (error) {
            console.error("Error fetching section details:", error);
        }
    };

    const fetchStudents = async () => {
        if (!sectionDetails?.department_id) return;

        try {
            const response = await axios.get(
                `${domain}/api/v1/student/list-of-students-of-department/${sectionDetails.department_id}`
            );
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const handleAutomateStudentEnrollment = async () => {
        try {
            const response = await axios.post(
                `${domain}/api/v1/section/assign-student-to-section`,
                { section_id }
            );

            if (response.status === 200) {
                await fetchSectionDetails();
                setIsEnrollmentDialogOpen(false);
            }
        } catch (error) {
            console.error("Error enrolling students:", error);
        }
    };

    const handleManualStudentEnrollment = async (studentId: number) => {
        try {
            const response = await axios.post(
                `${domain}/api/v1/section/assign-student-to-section`,
                {
                    section_id,
                    student_id: studentId,
                }
            );

            if (response.status === 200) {
                await fetchSectionDetails();
                setIsEnrollmentDialogOpen(false);
            }
        } catch (error) {
            console.error("Error enrolling student:", error);
        }
    };

    if (!sectionDetails) return <div>Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>{sectionDetails.section_name}</span>
                        <Badge variant="secondary">
                            {sectionDetails.student_count} /{" "}
                            {sectionDetails.max_capacity} Students
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p>
                                <strong>Department:</strong>{" "}
                                {sectionDetails.departments?.department_name}
                            </p>
                            <p>
                                <strong>Academic Year:</strong>{" "}
                                {sectionDetails.academic_year}
                            </p>
                            <p>
                                <strong>Semester:</strong>{" "}
                                {sectionDetails.semester}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Dialog
                                open={isEnrollmentDialogOpen}
                                onOpenChange={setIsEnrollmentDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            setIsEnrollmentDialogOpen(true);
                                            fetchStudents();
                                        }}
                                    >
                                        Enroll Students
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Enroll Students to Section
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Automatic Enrollment
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Button
                                                    onClick={
                                                        handleAutomateStudentEnrollment
                                                    }
                                                    className="w-full"
                                                >
                                                    Auto Assign Students
                                                </Button>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Automatically assign
                                                    eligible students from the
                                                    department
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Manual Enrollment
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ScrollArea className="h-72">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>
                                                                    Name
                                                                </TableHead>
                                                                <TableHead>
                                                                    Enrollment
                                                                </TableHead>
                                                                <TableHead>
                                                                    Actions
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {students.map(
                                                                (student) => {
                                                                    if(student.batch_year === sectionDetails.batch_year){

                                                                    return (
                                                                    <TableRow
                                                                        key={
                                                                            student.student_id
                                                                        }
                                                                    >
                                                                        <TableCell>
                                                                            {
                                                                                student
                                                                                    .users
                                                                                    ?.first_name
                                                                            }{" "}
                                                                            {
                                                                                student
                                                                                    .users
                                                                                    ?.last_name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {
                                                                                student.enrollment_number
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handleManualStudentEnrollment(
                                                                                        student.student_id
                                                                                    )
                                                                                }
                                                                            >
                                                                                Enroll
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            }
                                                        )}
                                                        </TableBody>
                                                    </Table>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Enrollment Number</TableHead>
                                    <TableHead>Batch Year</TableHead>
                                    <TableHead>Current Semester</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sectionStudents.map((student) => (
                                    <TableRow key={student.student_id}>
                                        <TableCell>
                                            {student.users?.first_name}{" "}
                                            {student.users?.last_name}
                                        </TableCell>
                                        <TableCell>
                                            {student.enrollment_number}
                                        </TableCell>
                                        <TableCell>
                                            {student.batch_year}
                                        </TableCell>
                                        <TableCell>
                                            {student.current_semester}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default SectionDashboard;
