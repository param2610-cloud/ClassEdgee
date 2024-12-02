import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
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
    units?: Unit[];
}

interface Unit {
    unit_id: number;
    unit_number: number;
    unit_name: string;
    required_hours: number;
    learning_objectives: string[];
    topics: Topic[];
}

interface Topic {
    topic_id: number;
    topic_name: string;
    topic_description?: string;
}

interface RouteParams {
    syllabusId: string;
    [key: string]: string | undefined;
}

const SubjectManagement: React.FC = () => {
    const { syllabus_id, course_id,semester_id } = useParams<RouteParams>();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
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
                        preferred_faculty_specializations:
                            formData.preferred_faculty_specializations.filter(
                                Boolean
                            ),
                        resources_required:
                            formData.resources_required.filter(Boolean),
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to create subject");

            const newSubject = await response.json();
            setSubjects([...subjects, newSubject]);

            setFormData(initialFormData);
        } catch (err) {
            setError("Failed to create subject");
        } finally {
            setLoading(false);
        }
    };

    const handleArrayFieldUpdate = (
        field: keyof Pick<
            FormData,
            "preferred_faculty_specializations" | "resources_required"
        >,
        index: number,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item)),
        }));
    };

    const addArrayField = (
        field: keyof Pick<
            FormData,
            "preferred_faculty_specializations" | "resources_required"
        >
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], ""],
        }));
    };

    const removeArrayField = (
        field: keyof Pick<
            FormData,
            "preferred_faculty_specializations" | "resources_required"
        >,
        index: number
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Subject</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Subject Type
                                </label>
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
                                        <SelectItem value="theory">
                                            Theory
                                        </SelectItem>
                                        <SelectItem value="lab">Lab</SelectItem>
                                        <SelectItem value="project">
                                            Project
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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

                        {/* Faculty Specializations */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Faculty Specializations
                            </label>
                            {formData.preferred_faculty_specializations.map(
                                (spec, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={spec}
                                            onChange={(e) =>
                                                handleArrayFieldUpdate(
                                                    "preferred_faculty_specializations",
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter specialization"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                removeArrayField(
                                                    "preferred_faculty_specializations",
                                                    index
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    addArrayField(
                                        "preferred_faculty_specializations"
                                    )
                                }
                                className="mt-2"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Specialization
                            </Button>
                        </div>

                        {/* Resources Required */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Resources Required
                            </label>
                            {formData.resources_required.map(
                                (resource, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={resource}
                                            onChange={(e) =>
                                                handleArrayFieldUpdate(
                                                    "resources_required",
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter required resource"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                removeArrayField(
                                                    "resources_required",
                                                    index
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    addArrayField("resources_required")
                                }
                                className="mt-2"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Resource
                            </Button>
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
                                <TableRow key={subject.subject_id} onClick={()=>navigate(`/p/course/${course_id}/semester/${semester_id}/syllabus/${syllabus_id}/subject/${subject.subject_id}`)}>
                                    <TableCell>{subject.subject_code}</TableCell>
                                    <TableCell className="capitalize">
                                        {subject.subject_name}
                                    </TableCell>
                                    <TableCell>{subject.subject_type}</TableCell>
                                    <TableCell>
                                        {subject.resources_required.join(", ")}
                                    </TableCell>
                                    <TableCell>
                                        {subject.preferred_faculty_specializations.join(
                                            ", "
                                        )}
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
