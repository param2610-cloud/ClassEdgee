import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Camera, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CryptoJS from "crypto-js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { domain } from "@/lib/constant";

// Define TypeScript interfaces
interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: "Male" | "Female" | "Other";
    qualifications: string;
    subjectExpertise: string;
    profile_image_link: string;
    address: Address;
    experience: string;
}

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
}

const CLOUDINARY_CLOUD_NAME = "";
const CLOUDINARY_UPLOAD_PRESET = "teacher_profile";
const CLOUDINARY_API_KEY = "";

const TeacherEditProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    // Fetch teacher data
    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const response = await axios.get(`${domain}/api/teachers/${id}`);
                setTeacher(response.data);
                setFormData(response.data);
                setLoading(false);
            } catch (error) {
                setError("Error fetching teacher details.");
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData!,
            [e.target.name]: e.target.value,
        });
        setIsChanged(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Handle image upload logic
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.put(`${domain}/api/teachers/${id}`, formData);
            setSuccess("Teacher profile updated successfully.");
            setSaving(false);
            setIsChanged(false);
        } catch (error: AxiosError) {
            setError("Error updating teacher profile.");
            setSaving(false);
        }
    };

    return (
        <div className="teacher-edit-profile">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Teacher Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        {error && <Alert>{error}</Alert>}
                        {success && <Alert>{success}</Alert>}

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 gap-4">
                            <Input
                                name="firstName"
                                value={formData?.firstName || ""}
                                onChange={handleChange}
                                placeholder="First Name"
                            />
                            <Input
                                name="lastName"
                                value={formData?.lastName || ""}
                                onChange={handleChange}
                                placeholder="Last Name"
                            />
                            <Input
                                name="email"
                                value={formData?.email || ""}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                            <Input
                                name="phoneNumber"
                                value={formData?.phoneNumber || ""}
                                onChange={handleChange}
                                placeholder="Phone Number"
                            />
                            <Select name="gender" value={formData?.gender || ""} onChange={handleChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Qualifications and Expertise */}
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            <Input
                                name="qualifications"
                                value={formData?.qualifications || ""}
                                onChange={handleChange}
                                placeholder="Qualifications"
                            />
                            <Input
                                name="subjectExpertise"
                                value={formData?.subjectExpertise || ""}
                                onChange={handleChange}
                                placeholder="Subject Expertise"
                            />
                            <Input
                                name="experience"
                                value={formData?.experience || ""}
                                onChange={handleChange}
                                placeholder="Experience"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                disabled={saving}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isChanged || saving}
                                className={
                                    !isChanged
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default TeacherEditProfile;
