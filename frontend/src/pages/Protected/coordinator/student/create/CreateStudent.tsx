import React, { useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, Camera } from "lucide-react";
import { domain } from "@/lib/constant";

const StudentRegistration = () => {
    const [activeTab, setActiveTab] = useState("manual");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [file, setFile] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName:"",
            middleName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            studentId: "",
            dateOfBirth: "",
            bloodGroup: "",
            gender: "",
            grade: "",
            section: "",
            previousSchool: "",
            guardianName: "",
            guardianRelation: "",
            guardianContact: "",
            medicalConditions: [],
            enrollmentDate:"",
            profile_image_link: "",
            username: "",
            password: "",
            
            address: {
                street: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
            },
            emergencyContact: {
                name: "",
                relation: "",
                phone: "",
            },
        }
    });

    // Watch for changes in studentId and dateOfBirth
    const studentId = watch("studentId");
    const dateOfBirth = watch("dateOfBirth");

    // Update username and password when studentId or dateOfBirth changes
    useEffect(() => {
        if (studentId) {
            setValue("username", studentId);
        }
    }, [studentId, setValue]);

    useEffect(() => {
        if (dateOfBirth) {
            // Remove hyphens from date string for password
            setValue("password", dateOfBirth.replace(/-/g, ""));
        }
    }, [dateOfBirth, setValue]);


    const handleProfileImageChange = async (e: any) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Preview
        const reader = new FileReader();
        reader.onload = () => {
            setProfileImagePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);

        setProfileImage(selectedFile);
        setUploadingImage(true);

        // Upload to Cloudinary
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("api_key", "978417188612515");
            formData.append(
                "timestamp",
                Math.round(new Date().getTime() / 1000).toString()
            );
            formData.append("upload_preset", "student_profile"); // You'll need to create this in Cloudinary

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/diacb8luh/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                setValue("profile_image_link", data.secure_url);
                setSuccess("Profile image uploaded successfully!");
            }
        } catch (err) {
            console.log(err);
            setError("Failed to upload profile image");
            setProfileImagePreview("");
            setProfileImage(null);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleManualSubmit = async (data: any) => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${domain}/api/v1/student/createstudent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to register student");
            }

            setSuccess("Student registered successfully!");
            reset();
            setProfileImagePreview("");
            setProfileImage(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: any) => {
        setFile(e.target.files[0]);
    };

    const handleBulkUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(
                `${domain}/api/v1/student/studentbulkupload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to upload students");
            }

            setSuccess("Students uploaded successfully!");
            setFile(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
<Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Student Registration</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <form
                            onSubmit={handleSubmit(handleManualSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Profile Image
                                </h3>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative w-32 h-32">
                                        {profileImagePreview ? (
                                            <img
                                                src={profileImagePreview}
                                                alt="Profile preview"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageChange}
                                            className="hidden"
                                            id="profile-image"
                                            disabled={uploadingImage}
                                        />
                                        <Label
                                            htmlFor="profile-image"
                                            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </Label>
                                    </div>
                                    {uploadingImage && (
                                        <p className="text-sm text-gray-500">
                                            Uploading...
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">
                                            First Name *
                                        </Label>
                                        <Input
                                            id="firstName"
                                            {...register("firstName", {
                                                required:
                                                    "First name is required",
                                            })}
                                            className={
                                                errors.firstName
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="middleName">
                                            Middle Name
                                        </Label>
                                        <Input
                                            id="middleName"
                                            {...register("middleName")}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">
                                            Last Name *
                                        </Label>
                                        <Input
                                            id="lastName"
                                            {...register("lastName", {
                                                required:
                                                    "Last name is required",
                                            })}
                                            className={
                                                errors.lastName
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="dateOfBirth">
                                            Date of Birth *
                                        </Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            {...register("dateOfBirth", {
                                                required:
                                                    "Date of birth is required",
                                            })}
                                            className={
                                                errors.dateOfBirth
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Gender *</Label>
                                        <Controller
                                            name="gender"
                                            control={control}
                                            rules={{
                                                required: "Gender is required",
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Male">
                                                            Male
                                                        </SelectItem>
                                                        <SelectItem value="Female">
                                                            Female
                                                        </SelectItem>
                                                        <SelectItem value="Other">
                                                            Other
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bloodGroup">
                                            Blood Group
                                        </Label>
                                        <Input
                                            id="bloodGroup"
                                            {...register("bloodGroup")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message:
                                                        "Invalid email format",
                                                },
                                            })}
                                            className={
                                                errors.email
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber">
                                            Phone Number *
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            {...register("phoneNumber", {
                                                required:
                                                    "Phone number is required",
                                            })}
                                            className={
                                                errors.phoneNumber
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Address *</Label>
                                    <Input
                                        placeholder="Street"
                                        {...register("address.street", {
                                            required: "Street is required",
                                        })}
                                        className={
                                            errors["address.street"]
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="City"
                                            {...register("address.city", {
                                                required: "City is required",
                                            })}
                                            className={
                                                errors["address.city"]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        <Input
                                            placeholder="State"
                                            {...register("address.state", {
                                                required: "State is required",
                                            })}
                                            className={
                                                errors["address.state"]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Postal Code"
                                            {...register("address.postalCode", {
                                                required:
                                                    "Postal code is required",
                                            })}
                                            className={
                                                errors["address.postalCode"]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        <Input
                                            placeholder="Country"
                                            {...register("address.country", {
                                                required: "Country is required",
                                            })}
                                            className={
                                                errors["address.country"]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="studentId">
                                            Student ID *
                                        </Label>
                                        <Input
                                            id="studentId"
                                            {...register("studentId", {
                                                required:
                                                    "Student ID is required",
                                            })}
                                            className={
                                                errors.studentId
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="enrollmentDate">
                                            Enrollment Date *
                                        </Label>
                                        <Input
                                            id="enrollmentDate"
                                            type="date"
                                            {...register("enrollmentDate", {
                                                required:
                                                    "Enrollment date is required",
                                            })}
                                            className={
                                                errors.enrollmentDate
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="grade">Grade *</Label>
                                        <Input
                                            id="grade"
                                            {...register("grade", {
                                                required: "Grade is required",
                                            })}
                                            className={
                                                errors.grade
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="section">Section</Label>
                                        <Input
                                            id="section"
                                            {...register("section")}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="previousSchool">
                                            Previous School
                                        </Label>
                                        <Input
                                            id="previousSchool"
                                            {...register("previousSchool")}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Login Credentials
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="username">
                                            Username (Same as Student Roll no)
                                        </Label>
                                        <Input
                                            id="username"
                                            {...register("username")}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">
                                            Password (Same as Date of Birth)
                                        </Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            {...register("password")}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Guardian Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Guardian Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="guardianName">
                                            Guardian Name *
                                        </Label>
                                        <Input
                                            id="guardianName"
                                            {...register("guardianName", {
                                                required:
                                                    "Guardian name is required",
                                            })}
                                            className={
                                                errors.guardianName
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="guardianRelation">
                                            Relation *
                                        </Label>
                                        <Input
                                            id="guardianRelation"
                                            {...register("guardianRelation", {
                                                required:
                                                    "Guardian relation is required",
                                            })}
                                            className={
                                                errors.guardianRelation
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="guardianContact">
                                            Contact *
                                        </Label>
                                        <Input
                                            id="guardianContact"
                                            {...register("guardianContact", {
                                                required:
                                                    "Guardian contact is required",
                                            })}
                                            className={
                                                errors.guardianContact
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Emergency Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="emergencyContact.name">
                                            Name *
                                        </Label>
                                        <Input
                                            id="emergencyContact.name"
                                            {...register(
                                                "emergencyContact.name",
                                                {
                                                    required:
                                                        "Emergency contact name is required",
                                                }
                                            )}
                                            className={
                                                errors["emergencyContact.name"]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="emergencyContact.relation">
                                            Relation *
                                        </Label>
                                        <Input
                                            id="emergencyContact.relation"
                                            {...register(
                                                "emergencyContact.relation",
                                                {
                                                    required:
                                                        "Emergency contact relation is required",
                                                }
                                            )}
                                            className={
                                                errors[
                                                    "emergencyContact.relation"
                                                ]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="emergencyContact.phone">
                                            Phone *
                                        </Label>
                                        <Input
                                            id="emergencyContact.phone"
                                            {...register(
                                                "emergencyContact.phone",
                                                {
                                                    required:
                                                        "Emergency contact phone is required",
                                                }
                                            )}
                                            className={
                                                errors["emergencyContact.phone"]
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading
                                    ? "Registering..."
                                    : "Register Student"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="bulk">
                        <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <Label
                                    htmlFor="file-upload"
                                    className="cursor-pointer"
                                >
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Excel files only (*.xlsx, *.xls)
                                    </p>
                                </Label>
                            </div>
                            {file && (
                                <p className="text-sm text-gray-600">
                                    Selected file: {file ? file.name : ""}
                                </p>
                            )}
                            <Button
                                onClick={handleBulkUpload}
                                disabled={!file || loading}
                                className="w-full"
                            >
                                {loading ? "Uploading..." : "Upload Students"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mt-4 bg-green-50 text-green-700 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default StudentRegistration;
