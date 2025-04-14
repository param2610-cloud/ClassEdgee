import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertCircle,
    User,
    Building2,
    GraduationCap,
    Upload,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { domain } from "@/lib/constant";
import { Department } from "@/interface/general";
import UploadOnCloudinary from "@/services/Cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";

const studentSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    departmentId: z.number().min(1, "Department is required"),
    enrollmentNumber: z.string().min(1, "Enrollment number is required"),
    batchYear: z.number().min(4, "Invalid batch year"),
    currentSemester: z.number().min(1, "Current semester is required"),
    guardianName: z.string().min(2, "Guardian name is required"),
    guardianContact: z.string().min(10, "Invalid guardian contact"),
    collegeUid: z.string().min(1, "College UID is required"),
    profilePictureUrl: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

const EditStudentForm = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [departmentList, setDepartmentList] = useState<Department[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const { user_id } = useParams();
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [imageMediaLinks, setImageMediaLinks] = useState<string[]>([]);
    const [, setVideoMediaLinks] = useState<string[]>([]);
    const [institution_id] = useAtom(institutionIdAtom)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
    });

    // Watch profilePictureUrl to update preview
    watch("profilePictureUrl");

    useEffect(() => {
        // When imageMediaLinks changes and has items, update the form
        if (imageMediaLinks.length > 0) {
            setValue('profilePictureUrl', imageMediaLinks[0]);
            setPreviewUrl(imageMediaLinks[0]);
        }
    }, [imageMediaLinks, setValue]);

    // Fetch student data
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`${domain}/api/v1/student/get-student/${user_id}`);
                const studentData = response.data.data;
                
                reset({
                    firstName: studentData.users.first_name,
                    lastName: studentData.users.last_name,
                    email: studentData.users.email,
                    phoneNumber: studentData.users.phone_number,
                    departmentId: studentData.department_id,
                    enrollmentNumber: studentData.enrollment_number,
                    batchYear: studentData.batch_year,
                    currentSemester: studentData.current_semester,
                    guardianName: studentData.guardian_name,
                    guardianContact: studentData.guardian_contact,
                    collegeUid: studentData.users.college_uid,
                    profilePictureUrl: studentData.users.profile_picture || "",
                });

                setPreviewUrl(studentData.users.profile_picture || "");
            } catch (error) {
                console.error("Error fetching student data:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch student data",
                    variant: "destructive",
                });
            }
        };

        if (user_id) {
            fetchStudentData();
        }
    }, [user_id, reset]);

    // Fetch departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(
                    `${domain}/api/v1/department/list-of-department`,
                    {
                        headers: {
                            "X-Institution-Id": `${institution_id}`,
                        }
                    }
                );
                setDepartmentList(response.data.department);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };
        fetchDepartments();
    }, []);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploadingImage(true);
                // Set temporary preview
                setPreviewUrl(URL.createObjectURL(file));

                await UploadOnCloudinary({
                    mediaFiles: [file],
                    setuploadedImageMediaLinks: setImageMediaLinks,
                    setuploadedVideoMediaLinks: setVideoMediaLinks,
                });

            } catch (error) {
                console.error('Image upload error:', error);
                toast({
                    title: "Error",
                    description: "Failed to upload image. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const onSubmit = async (data: StudentFormData) => {
        setIsLoading(true);
        setError("");

        try {
            await axios.put(
                `${domain}/api/v1/student/edit/${user_id}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            toast({
                title: "Success!",
                description: "Student information has been updated successfully.",
                duration: 5000,
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An error occurred";
            setError(errorMessage);
            toast({
                title: "Error",
                description: "Failed to update student information. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Edit Student Information
                    </CardTitle>
                    <CardDescription>
                        Update the student's information. All fields marked with * are required.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage
                                    src={previewUrl}
                                    alt="Profile preview"
                                />
                                <AvatarFallback>
                                    <User className="h-16 w-16" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-center">
                                <Label
                                    htmlFor="profilePicture"
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
                                        <Upload className="h-4 w-4" />
                                        <span>
                                            {uploadingImage
                                                ? "Uploading..."
                                                : "Upload Photo"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        id="profilePicture"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                </Label>
                            </div>
                        </div>
                        {/* Personal Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    Personal Information
                                </h3>
                            </div>
                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First Name *
                                    </Label>
                                    <Input {...register("firstName")} />
                                    {errors.firstName && (
                                        <p className="text-sm text-destructive">
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last Name *
                                    </Label>
                                    <Input {...register("lastName")} />
                                    {errors.lastName && (
                                        <p className="text-sm text-destructive">
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Address *
                                    </Label>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">
                                        Phone Number *
                                    </Label>
                                    <Input {...register("phoneNumber")} />
                                    {errors.phoneNumber && (
                                        <p className="text-sm text-destructive">
                                            {errors.phoneNumber.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    Academic Information
                                </h3>
                            </div>
                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="enrollmentNumber">
                                        Enrollment Number *
                                    </Label>
                                    <Input {...register("enrollmentNumber")} />
                                    {errors.enrollmentNumber && (
                                        <p className="text-sm text-destructive">
                                            {errors.enrollmentNumber.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="departmentId">
                                        Department *
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue(
                                                "departmentId",
                                                parseInt(value)
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentList.map(
                                                (dept: Department) => (
                                                    <SelectItem
                                                        key={dept.department_id}
                                                        value={dept.department_id.toString()}
                                                    >
                                                        {dept.department_name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.departmentId && (
                                        <p className="text-sm text-destructive">
                                            {errors.departmentId.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batchYear">
                                        Batch Year *
                                    </Label>
                                    <Input {...register("batchYear")} />
                                    {errors.batchYear && (
                                        <p className="text-sm text-destructive">
                                            {errors.batchYear.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currentSemester">
                                        Current Semester *
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue(
                                                "currentSemester",
                                                parseInt(value)
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(
                                                (sem) => (
                                                    <SelectItem
                                                        key={sem}
                                                        value={sem.toString()}
                                                    >
                                                        Semester {sem}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.currentSemester && (
                                        <p className="text-sm text-destructive">
                                            {errors.currentSemester.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Guardian Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    Guardian Information
                                </h3>
                            </div>
                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="guardianName">
                                        Guardian Name *
                                    </Label>
                                    <Input {...register("guardianName")} />
                                    {errors.guardianName && (
                                        <p className="text-sm text-destructive">
                                            {errors.guardianName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="guardianContact">
                                        Guardian Contact *
                                    </Label>
                                    <Input {...register("guardianContact")} />
                                    {errors.guardianContact && (
                                        <p className="text-sm text-destructive">
                                            {errors.guardianContact.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="collegeUid">
                                        College UID *
                                    </Label>
                                    <Input {...register("collegeUid")} />
                                    {errors.collegeUid && (
                                        <p className="text-sm text-destructive">
                                            {errors.collegeUid.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Student"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditStudentForm;
