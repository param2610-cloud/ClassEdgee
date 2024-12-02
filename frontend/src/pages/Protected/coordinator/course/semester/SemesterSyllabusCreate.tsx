import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { domain } from "@/lib/constant";

interface FormData {
    course_id: number;
    subject_type: string;
    preferred_faculty_specializations: string[];
    resources_required: string[];
    subject_name: string;
    subject_code: string;
}

interface Subject extends FormData {
    subject_id: number;
    syllabus_id: number;
    created_at?: string;
    updated_at?: string;
}

interface RouteParams {
    syllabusId: string;
    [key: string]: string | undefined;
}

const SubjectManagement: React.FC = () => {
    const { syllabus_id, course_id, semester_id } = useParams<RouteParams>();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formVisible, setFormVisible] = useState(false);
    const navigate = useNavigate();

    const initialFormData: FormData = {
        course_id: course_id ? parseInt(course_id) : 0,
        subject_type: "",
        preferred_faculty_specializations: [""],
        resources_required: [""],
        subject_name: "",
        subject_code: "",
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${domain}/api/v1/curriculum/syllabus/${syllabus_id}/subjects`
                );
                if (!response.ok) throw new Error("Failed to fetch subjects");
                const data = await response.json();
                setSubjects(data);
            } catch (err) {
                setError("Failed to load subjects");
            } finally {
                setLoading(false);
            }
        };

        if (syllabus_id) fetchSubjects();
    }, [syllabus_id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch(
                `${domain}/api/v1/curriculum/subject/${syllabus_id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        preferred_faculty_specializations: formData.preferred_faculty_specializations.filter(Boolean),
                        resources_required: formData.resources_required.filter(Boolean),
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to create subject");

            const newSubject = await response.json();
            setSubjects([...subjects, newSubject]);

            setFormData(initialFormData);
            setFormVisible(false);
        } catch (err) {
            setError("Failed to create subject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Subject Management</h1>
                <Button
                    variant="default"
                    onClick={() => setFormVisible(!formVisible)}
                >
                    Create Subject
                </Button>
            </div>

            {formVisible && (
                <div className="absolute top-0 left-0 w-full bg-white shadow-md p-6 slide-in-top z-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Subject</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Subject Type</Label>
                                    <Select
                                        value={formData.subject_type}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                subject_type: value,
                                            }))
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="theory">Theory</SelectItem>
                                            <SelectItem value="lab">Lab</SelectItem>
                                            <SelectItem value="project">Project</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject Name</Label>
                                    <Input
                                        value={formData.subject_name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                subject_name: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter subject name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject Code</Label>
                                    <Input
                                        value={formData.subject_code}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                subject_code: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter subject code"
                                    />
                                </div>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Creating..." : "Create Subject"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Existing Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject CODE</TableHead>
                                <TableHead>Subject Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Resources</TableHead>
                                <TableHead>Specializations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.map((subject) => (
                                <TableRow
                                className="cursor-pointer"
                                    key={subject.subject_id}
                                    onClick={() =>
                                        navigate(
                                            `/p/course/${course_id}/semester/${semester_id}/syllabus/${syllabus_id}/subject/${subject.subject_id}`
                                        )
                                    }
                                >
                                    <TableCell>{subject.subject_code}</TableCell>
                                    <TableCell className="capitalize">
                                        {subject.subject_name}
                                    </TableCell>
                                    <TableCell>{subject.subject_type}</TableCell>
                                    <TableCell>
                                        {subject.resources_required.join(", ")}
                                    </TableCell>
                                    <TableCell>
                                        {subject.preferred_faculty_specializations.join(", ")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubjectManagement;
