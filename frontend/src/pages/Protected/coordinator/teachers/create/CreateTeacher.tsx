import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  z } from "zod";
import axios from "axios";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { domain } from "@/lib/constant";
import { Department } from "@/interface/general";
import UploadOnCloudinary from "@/services/Cloudinary";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";
import { useNavigate } from "react-router-dom";

// Add your Cloudinary configuration
// const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || "";
// const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

const facultySchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string(),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phoneNumber: z.string().optional(),
    departmentId: z.number().min(1, "Department is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    designation: z.string().min(1, "Designation is required"),
    joiningDate: z.string().min(1, "Joining date is required"),
    contractEndDate: z.string().optional(),
    expertise: z.string().optional(),
    qualifications: z.string().optional(),
    maxWeeklyHours: z.number().min(1).max(168),
    researchInterests: z.string().optional(),
    publications: z.string().optional(),
    profilePicture: z.any().optional(),
    profilePictureUrl: z.string().optional(), // Add this new field
});

type FacultyFormData = z.infer<typeof facultySchema>;

const CreateFacultyForm = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [, setProfileFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [departmentList, setDepartmentList] = useState<Department[]>([]);
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [, setVideoLinks] = useState<string[]>([]);
    const [institution_id] = useAtom(institutionIdAtom);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FacultyFormData>({
        resolver: zodResolver(facultySchema),
        defaultValues: {
            maxWeeklyHours: 40,
            profilePictureUrl: "",
        },
    });
    useEffect(() => {
        if (imageLinks.length > 0) {
            setValue('profilePictureUrl', imageLinks[0]);
            console.log("Updated profilePictureUrl:", imageLinks[0]);
        }
    }, [imageLinks, setValue]);

    
    useEffect(()=>{
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${domain}/api/v1/department/list-of-department`,{
                    headers:{
                        "X-Institution-Id": `${institution_id}`,
                    }
                });
                setDepartmentList(response.data.department);
                console.log("departments",response.data);
                
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };
        fetchDepartments();
    },[])
    useEffect(() => {
        if (imageLinks.length > 0) {
            setValue('profilePictureUrl', imageLinks[0]);
            console.log("Updated profilePictureUrl:", imageLinks[0]);
        }
    }, [imageLinks, setValue]);
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploadingImage(true);
                setProfileFile(file);
                setProfilePicturePreview(URL.createObjectURL(file));
                
                await UploadOnCloudinary({
                    mediaFiles: [file],
                    setuploadedImageMediaLinks: setImageLinks,
                    setuploadedVideoMediaLinks: setVideoLinks,
                });
                
            } catch (error) {
                console.error('Image upload error:', error);
                toast({
                    title: "Error",
                    description: "Failed to upload image. Please try again.",
                    variant: "destructive",
                    duration: 5000,
                });
                setProfileFile(null);
            } finally {
                setUploadingImage(false);
            }
        }
    };
    const onSubmit = async (data: FacultyFormData) => {
        setIsLoading(true);
        setError("");

        try {
            // Format the data according to the backend requirements
            const formattedData = {
                ...data, // Include all form data
                expertise: data.expertise ? data.expertise.split(',').map(item => item.trim()) : [],
                qualifications: data.qualifications ? data.qualifications.split(',').map(item => item.trim()) : [],
                maxWeeklyHours: Number(data.maxWeeklyHours),
                researchInterests: data.researchInterests ? data.researchInterests.split(',').map(item => item.trim()) : [],
                publications: data.publications ? data.publications.split(',').map(item => item.trim()) : [],
                profilePictureUrl: data.profilePictureUrl || undefined, // Ensure profilePictureUrl is included
                institute_id:institution_id
            };

            console.log("Submitting data:", formattedData);

            const response = await axios.post(
                `${domain}/api/v1/faculty/createfaculty`,
                formattedData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast({
                    title: "Success!",
                    description: "Faculty member has been created successfully.",
                    duration: 5000,
                });
                // Redirect to faculty list page
                navigate("/p/faculty");

            } else {
                throw new Error(response.data.message || "Failed to create faculty member");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage || "Failed to create faculty member. Please try again.",
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
                        Create New Faculty Member
                    </CardTitle>
                    <CardDescription>
                        Enter the details for the new faculty member. All fields
                        marked with * are required.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage
                                    src={profilePicturePreview}
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
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        {...register("password")}
                                        type="password"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">
                                        Phone Number
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

                        {/* Employment Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">
                                    Employment Information
                                </h3>
                            </div>
                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="employeeId">
                                        Employee ID *
                                    </Label>
                                    <Input
                                        {...register("employeeId")}
                                        placeholder="FAC001"
                                    />
                                    {errors.employeeId && (
                                        <p className="text-sm text-destructive">
                                            {errors.employeeId.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="departmentId">
                                        Department *
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("departmentId", parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentList.map((dept:Department) => (
                                                <SelectItem
                                                    key={dept.department_id}
                                                    value={dept.department_id.toString()}
                                                >
                                                    {dept.department_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.departmentId && (
                                        <p className="text-sm text-destructive">
                                            {errors.departmentId.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="designation">
                                        Designation *
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("designation", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="professor">
                                                Professor
                                            </SelectItem>
                                            <SelectItem value="associate">
                                                Associate Professor
                                            </SelectItem>
                                            <SelectItem value="assistant">
                                                Assistant Professor
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.designation && (
                                        <p className="text-sm text-destructive">
                                            {errors.designation.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxWeeklyHours">
                                        Max Weekly Hours *
                                    </Label>
                                    <Input
                                        type="number"
                                        {...register("maxWeeklyHours", {
                                            valueAsNumber: true,
                                        })}
                                        placeholder="40"
                                    />
                                    {errors.maxWeeklyHours && (
                                        <p className="text-sm text-destructive">
                                            {errors.maxWeeklyHours.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="joiningDate">
                                        Joining Date *
                                    </Label>
                                    <Input
                                        {...register("joiningDate")}
                                        type="date"
                                    />
                                    {errors.joiningDate && (
                                        <p className="text-sm text-destructive">
                                            {errors.joiningDate.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contractEndDate">
                                        Contract End Date
                                    </Label>
                                    <Input
                                        {...register("contractEndDate")}
                                        type="date"
                                    />
                                    {errors.contractEndDate && (
                                        <p className="text-sm text-destructive">
                                            {errors.contractEndDate.message}
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

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="qualifications">
                                        Qualifications
                                    </Label>
                                    <Input
                                        {...register("qualifications")}
                                        placeholder="Ph.D. in Computer Science, M.Sc. in Mathematics"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Separate multiple qualifications with
                                        commas
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expertise">
                                        Areas of Expertise
                                    </Label>
                                    <Input
                                        {...register("expertise")}
                                        placeholder="Machine Learning, Data Science, Algorithm Design"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Separate multiple areas with commas
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="researchInterests">
                                        Research Interests
                                    </Label>
                                    <Input
                                        {...register("researchInterests")}
                                        placeholder="Artificial Intelligence, Neural Networks"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Separate multiple interests with commas
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="publications">
                                        Notable Publications
                                    </Label>
                                    <Input
                                        {...register("publications")}
                                        placeholder="Title of publications"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Separate multiple publications with
                                        commas
                                    </p>
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
                                {isLoading ? "Creating..." : "Create Faculty"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateFacultyForm;
