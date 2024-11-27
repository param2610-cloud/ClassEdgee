import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Building2,
    User,
    Upload,
    Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UploadOnCloudinary from "@/services/Cloudinary";
import { domain } from "@/lib/constant";

// Define an interface for form data to provide type safety
interface RegistrationFormData {
    user_user_id: string;
    user_password_hash: string;
    user_email: string;
    user_firstname: string;
    user_lastname: string;
    user_phone_number: string;
    user_profile_picture: string;
    institution_name: string;
    institution_code: string;
    institution_address: string;
    institution_contact_email: string;
    institution_contact_phone: string;
    institution_license_type: string;
}

// Define an interface for errors
interface FormErrors {
    [key: string]: string;
}

const Registration: React.FC = () => {
    const [formData, setFormData] = useState<RegistrationFormData>({
        // User details
        user_user_id: "",
        user_password_hash: "",
        user_email: "",
        user_firstname: "",
        user_lastname: "",
        user_phone_number: "",
        user_profile_picture: "",

        // Institution details
        institution_name: "",
        institution_code: "",
        institution_address: "",
        institution_contact_email: "",
        institution_contact_phone: "",
        institution_license_type: "premium",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const { toast } = useToast();
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageLinks, setImageLinks] = useState<string[]>([]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const requiredFields: (keyof RegistrationFormData)[] = [
            "user_user_id",
            "user_password_hash",
            "user_email",
            "user_firstname",
            "user_lastname",
            "user_phone_number",
            "institution_name",
            "institution_code",
            "institution_address",
            "institution_contact_email",
            "institution_contact_phone",
        ];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.replace(/_/g, " ")} is required`;
            }
        });

        if (formData.user_password_hash.length < 8) {
            newErrors.user_password_hash = "Password must be at least 8 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploadingImage(true);
                setProfilePicturePreview(URL.createObjectURL(file));

                await UploadOnCloudinary({
                    mediaFiles: [file],
                    setuploadedImageMediaLinks: setImageLinks,
                    setuploadedVideoMediaLinks: () => {}, // Added empty function
                });

                // Set the first uploaded image URL as the profile picture URL
                if (imageLinks.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        user_profile_picture: imageLinks[0],
                    }));
                }
            } catch (error) {
                console.error("Image upload error:", error);
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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.post<any>(
                `${domain}/api/v1/supreme/register`,
                formData
            );

            if (response.data) {
                toast({
                    title: "Success",
                    description: "Institution registered successfully!",
                });
            }
        } catch (error: unknown) {
            console.error("Registration error:", error);
            if (axios.isAxiosError(error)) {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "An error occurred during registration",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An unexpected error occurred",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-blue-800 flex items-center">
                        <Building2 className="mr-3 text-blue-600" />
                        Institution Registration
                    </CardTitle>
                    <CardDescription>
                        Create your institution and admin account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-2 gap-6"
                    >
                        {/* User Section */}
                        <div className="space-y-4 col-span-2 md:col-span-1">
                            <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                <User className="mr-2 text-blue-500" /> Admin
                                Details
                            </h3>
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
                            <div>
                                <Label htmlFor="user_user_id">College ID</Label>
                                <Input
                                    id="user_user_id"
                                    name="user_user_id"
                                    value={formData.user_user_id}
                                    onChange={handleChange}
                                    placeholder="Enter College ID"
                                    className={
                                        errors.user_user_id
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.user_user_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.user_user_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="user_firstname">
                                    First Name
                                </Label>
                                <Input
                                    id="user_firstname"
                                    name="user_firstname"
                                    value={formData.user_firstname}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className={
                                        errors.user_firstname
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.user_firstname && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.user_firstname}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="user_lastname">Last Name</Label>
                                <Input
                                    id="user_lastname"
                                    name="user_lastname"
                                    value={formData.user_lastname}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className={
                                        errors.user_lastname
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.user_lastname && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.user_lastname}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="user_email">Email</Label>
                                <Input
                                    type="email"
                                    id="user_email"
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    placeholder="admin@institution.com"
                                    className={
                                        errors.user_email
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.user_email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.user_email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="user_password_hash">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    id="user_password_hash"
                                    name="user_password_hash"
                                    value={formData.user_password_hash}
                                    onChange={handleChange}
                                    placeholder="Strong password"
                                    className={
                                        errors.user_password_hash
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.user_password_hash && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.user_password_hash}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="user_phone_number">
                                    Phone Number
                                </Label>
                                <Input
                                    type="tel"
                                    id="user_phone_number"
                                    name="user_phone_number"
                                    value={formData.user_phone_number}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className={
                                        errors.user_phone_number
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.user_phone_number && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.user_phone_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Institution Section */}
                        <div className="space-y-4 col-span-2 md:col-span-1">
                            <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                                <Building2 className="mr-2 text-blue-500" />{" "}
                                Institution Details
                            </h3>

                            <div>
                                <Label htmlFor="institution_name">
                                    Institution Name
                                </Label>
                                <Input
                                    id="institution_name"
                                    name="institution_name"
                                    value={formData.institution_name}
                                    onChange={handleChange}
                                    placeholder="Full institution name"
                                    className={
                                        errors.institution_name
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.institution_name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.institution_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="institution_code">
                                    Institution Code
                                </Label>
                                <Input
                                    id="institution_code"
                                    name="institution_code"
                                    value={formData.institution_code}
                                    onChange={handleChange}
                                    placeholder="Unique institution code"
                                    className={
                                        errors.institution_code
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.institution_code && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.institution_code}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="institution_address">
                                    Address
                                </Label>
                                <Input
                                    id="institution_address"
                                    name="institution_address"
                                    value={formData.institution_address}
                                    onChange={handleChange}
                                    placeholder="Full institution address"
                                    className={
                                        errors.institution_address
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.institution_address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.institution_address}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="institution_contact_email">
                                    Contact Email
                                </Label>
                                <Input
                                    type="email"
                                    id="institution_contact_email"
                                    name="institution_contact_email"
                                    value={formData.institution_contact_email}
                                    onChange={handleChange}
                                    placeholder="institution@email.com"
                                    className={
                                        errors.institution_contact_email
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.institution_contact_email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.institution_contact_email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="institution_contact_phone">
                                    Contact Phone
                                </Label>
                                <Input
                                    type="tel"
                                    id="institution_contact_phone"
                                    name="institution_contact_phone"
                                    value={formData.institution_contact_phone}
                                    onChange={handleChange}
                                    placeholder="Institution contact number"
                                    className={
                                        errors.institution_contact_phone
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.institution_contact_phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.institution_contact_phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="institution_license_type">
                                    License Type
                                </Label>
                                <Input
                                    id="institution_license_type"
                                    name="institution_license_type"
                                    value={formData.institution_license_type}
                                    onChange={handleChange}
                                    placeholder="Premium (default)"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="col-span-2 flex justify-center mt-6">
                            <Button
                                type="submit"
                                className="w-full max-w-md bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <Shield className="mr-2" /> Register Institution
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Registration;
