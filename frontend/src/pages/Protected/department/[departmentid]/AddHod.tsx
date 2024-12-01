import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";
import { domain } from "@/lib/constant";
import { Department, User, Faculty } from "@/interface/general";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
// for edit hod , at first show details of hod , then give access to edit 

const AddHod: React.FC = () => {
    const { department_id } = useParams<{ department_id: string }>();
    const navigate = useNavigate();

    const [institution_id,setInstitutionId] = useAtom(institutionIdAtom);
    const [department, setDepartment] = useState<Department | null>(null);
    const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
    const [selectedHod, setSelectedHod] = useState<Faculty | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch department details
                const departmentResponse = await axios.get(
                    `${domain}/api/v1/department/${department_id}/${institution_id}`
                );
                setDepartment(departmentResponse.data.department);

                // Fetch list of faculty members
                const facultyResponse = await axios.get(
                    `${domain}/api/v1/department/list-of-faculty/${department_id}/${institution_id}`
                );
                setFacultyMembers(facultyResponse.data.faculty);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch department or faculty data");
            }
        };
        if(institution_id !== null){
            fetchInitialData();
        }else{
            
            setInstitutionId(localStorage.getItem("institution_id") as string);
        }
    }, [department_id, institution_id]);

    const handleAddHod = async () => {
        if (!selectedHod) {
            setError("Please select a faculty member to assign as HOD");
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                `${domain}/api/v1/department/add-hod/${department_id}/${institution_id}`,
                { hod_user_id: selectedHod.users?.user_id }
            );

            // Redirect or show success message
            navigate(`/p/department/${department_id}`);
        } catch (err) {
            console.error("Error adding HOD:", err);
            setError("Failed to assign HOD");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-md mx-auto mt-10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!department) {
        return (
            <div className="text-center mt-10">
                Loading department details...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {
                department.users && (
                    <div>
                        {department.users.first_name} {department.users.last_name}
                    </div>
                )
            }
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>
                        Assign Head of Department for{" "}
                        {department.department_name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select
                        onValueChange={(value) => {
                            const selectedFaculty = facultyMembers.find(
                                (f) => f.faculty_id === parseInt(value)
                            );
                            setSelectedHod(selectedFaculty || null);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Faculty Member" />
                        </SelectTrigger>
                        <SelectContent>
                            {facultyMembers.map((faculty) => (
                                <SelectItem
                                    key={faculty.faculty_id}
                                    value={faculty.faculty_id.toString()}
                                >
                                    {faculty.users?.first_name}{" "}
                                    {faculty.users?.last_name}-{" "}
                                    {faculty.designation}-{" "}
                                    {faculty.departments?.department_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedHod && (
                        <div className="mt-4 p-3 bg-secondary/20 rounded-md">
                            <h4 className="font-semibold">
                                Selected HOD Details:
                            </h4>
                            <p>
                                {selectedHod.users?.first_name}{" "}
                                {selectedHod.users?.last_name}
                            </p>
                            <p className="text-muted-foreground">
                                Designation: {selectedHod.designation}
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={handleAddHod}
                        disabled={!selectedHod || loading}
                        className="w-full mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            "Assign as HOD"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddHod;
