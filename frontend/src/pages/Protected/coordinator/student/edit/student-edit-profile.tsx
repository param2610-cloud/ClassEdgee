import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Camera, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define TypeScript interfaces
interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: "Male" | "Female" | "Other";
    bloodGroup: string;
    profile_image_link: string;
    address: Address;
    guardianName: string;
    guardianRelation: string;
    guardianContact: string;
}

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
}

const CLOUDINARY_CLOUD_NAME = "diacb8luh";
const CLOUDINARY_UPLOAD_PRESET = "student_profile";
const CLOUDINARY_API_KEY = "978417188612515";

const StudentEditProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Student | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const [profileImagePreview, setProfileImagePreview] = useState<
        string | null
    >(null);

    const getPublicIdFromUrl = (url: string): string | null => {
        try {
            const urlParts = url.split("/");
            const filename = urlParts[urlParts.length - 1];
            return filename.split(".")[0];
        } catch (error) {
            console.error("Error extracting public_id:", error);
            return null;
        }
    };

    const deleteImageFromCloudinary = async (
        imageUrl: string
    ): Promise<void> => {
        const public_id = getPublicIdFromUrl(imageUrl);
        if (!public_id) return;

        try {
            const timestamp = Math.round(
                new Date().getTime() / 1000
            ).toString();
            const formData = new FormData();
            formData.append("public_id", public_id);
            formData.append("api_key", CLOUDINARY_API_KEY);
            formData.append("timestamp", timestamp);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.result !== "ok") {
                throw new Error("Failed to delete image from Cloudinary");
            }
        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
        }
    };

    const handleProfileImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type and size
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Please upload a valid image file (JPEG, PNG)");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            // 5MB limit
            setError("Image size should be less than 5MB");
            return;
        }

        setUploadingImage(true);
        setError(null);

        try {
            // Show preview
            const reader = new FileReader();
            reader.onload = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);

            // Upload to Cloudinary
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile);
            uploadFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: uploadFormData,
                }
            );

            const data: CloudinaryResponse = await response.json();

            if (data.secure_url) {
                // Delete old image if exists
                if (formData?.profile_image_link) {
                    await deleteImageFromCloudinary(
                        formData.profile_image_link
                    );
                }

                setFormData((prev) =>
                    prev
                        ? {
                              ...prev,
                              profile_image_link: data.secure_url,
                          }
                        : null
                );
                setSuccess("Profile image updated successfully!");
                setIsChanged(true);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to update profile image");
            setProfileImagePreview(formData?.profile_image_link || null);
        } finally {
            setUploadingImage(false);
        }
    };

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await axios.get<{ data: Student }>(
                    `/api/v1/student/get-student/${id}`
                );
                setStudent(response.data.data);
                setFormData(response.data.data);
                setProfileImagePreview(response.data.data.profile_image_link);
                setLoading(false);
            } catch (err) {
                const error = err as AxiosError;
                setError(
                    error.response?.data?.message ||
                        "Failed to fetch student data"
                );
                setLoading(false);
            }
        };

        if (id) {
            fetchStudent();
        }
    }, [id]);

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | { target: { name: string; value: string } }
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            if (!prev) return null;

            if (name.includes(".")) {
                const [parent, child] = name.split(".");
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent as keyof Student],
                        [child]: value,
                    },
                };
            }
            return {
                ...prev,
                [name]: value,
            };
        });
        setIsChanged(true);
        setError(null); // Clear any previous errors
    };

    const validateForm = (): boolean => {
        if (!formData) return false;

        if (
            !formData.email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            setError("Please enter a valid email address");
            return false;
        }

        if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
            setError("Please enter a valid 10-digit phone number");
            return false;
        }

        if (
            !formData.guardianContact ||
            !/^\d{10}$/.test(formData.guardianContact)
        ) {
            setError("Please enter a valid guardian contact number");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.put<{ data: Student }>(
                `/api/v1/student/edit/${id}`,
                formData
            );

            setStudent(response.data.data);
            setIsChanged(false);
            setSuccess("Profile updated successfully!");

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const error = err as AxiosError;
            setError(
                error.response?.data?.message ||
                    "Failed to update profile. Please try again."
            );
            setProfileImagePreview(student?.profile_image_link || null);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!student || !formData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Alert variant="destructive">
                    <AlertDescription>Student not found</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Student Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <img
                                    src={
                                        profileImagePreview ||
                                        "/placeholder-avatar.png"
                                    }
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                                />
                                <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                                    {uploadingImage ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-white" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleProfileImageChange}
                                        disabled={uploadingImage}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Success/Error Messages */}
                        {success && (
                            <Alert>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                required
                            />
                            <Input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                required
                            />
                            <Input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                type="email"
                                required
                            />
                            <Input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                pattern="\d{10}"
                                title="Please enter a valid 10-digit phone number"
                                required
                            />
                            <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                    handleChange({
                                        target: { name: "gender", value },
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">
                                        Female
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                placeholder="Blood Group"
                                required
                            />

                            {/* Address Fields */}
                            <Input
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                placeholder="Street"
                                required
                            />
                            <Input
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                placeholder="City"
                                required
                            />
                            <Input
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                placeholder="State"
                                required
                            />
                            <Input
                                name="address.postalCode"
                                value={formData.address.postalCode}
                                onChange={handleChange}
                                placeholder="Postal Code"
                                required
                            />
                            <Input
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleChange}
                                placeholder="Country"
                                required
                            />

                            {/* Guardian Fields */}
                            <Input
                                name="guardianName"
                                value={formData.guardianName}
                                onChange={handleChange}
                                placeholder="Guardian Name"
                                required
                            />
                            <Input
                                name="guardianRelation"
                                value={formData.guardianRelation}
                                onChange={handleChange}
                                placeholder="Guardian Relation"
                                required
                            />
                            <Input
                                name="guardianContact"
                                value={formData.guardianContact}
                                onChange={handleChange}
                                placeholder="Guardian Contact"
                                pattern="\d{10}"
                                title="Please enter a valid 10-digit contact number"
                                required
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

// export default StudentEditProfile;
