import React, { useState } from "react";
import { domain } from "@/lib/constant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {  useNavigate } from "react-router-dom";

interface FormData {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactInfo: {
        email: string;
        phone: string;
    };
    address: string;
    employeeId: string;
    educationalQualifications: string;
    yearsOfExperience: string;
    dateOfJoining: string;
    username: string;
    password: string;
}

const Idgenerate: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        contactInfo: {
            email: "",
            phone: "",
        },
        address: "",
        employeeId: "",
        educationalQualifications: "",
        yearsOfExperience: "",
        dateOfJoining: "",
        username: "",
        password: "",
    });
    const [generatedId, setGeneratedId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "email" || name === "phone") {
            setFormData((prevData) => ({
                ...prevData,
                contactInfo: {
                    ...prevData.contactInfo,
                    [name]: value,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateForm = (): string | null => {
        const requiredFields = [
            "fullName",
            "dateOfBirth",
            "gender",
            "contactInfo",
            "address",
            "employeeId",
            "educationalQualifications",
            "yearsOfExperience",
            "dateOfJoining",
            "username",
            "password",
        ];

        for (const field of requiredFields) {
            if (field === "contactInfo") {
                if (
                    !formData.contactInfo.email ||
                    !formData.contactInfo.phone
                ) {
                    return `Missing required field: ${field}`;
                }
            } else if (!formData[field as keyof FormData]) {
                return `Missing required field: ${field}`;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactInfo.email)) {
            return "Invalid email format";
        }

        if (formData.password.length < 8) {
            return "Password must be at least 8 characters long";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${domain}/api/v1/supreme/principal-create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setGeneratedId(data.principalId);
                toast({
                    title: "Success",
                    description: "Principal created successfully!",
                });
            } else {
                setError(data.message || "An error occurred");
            }
        } catch (error) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmail = async () => {
        const response = await fetch(
            `${domain}/api/v1/principal/principal-data-email-send`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({
                    uid:generatedId, email:formData.contactInfo.email, username:formData.username, password:formData.password
                })
            }
        );
        if(response.status === 200){
            toast({
                title: "Email Sent",
                description:
                "Authentication data has been sent to the principal's email.",
            });
        }else{
            toast({
                title: "Error",
                description: "An error occurred while sending the email.",
            });
        }
    };
    const navigate =useNavigate();
    const handleroute = () => {
        navigate('/p');
      };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="">
            <button
          className="absolute w-[140px] top-10 left-4 mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-300 ease-in-out"
          onClick={handleroute}
        >
          Dashboard
        </button>
            </div>
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Generate Principal ID
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="personalInfo" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="personalInfo">
                            Personal Information
                        </TabsTrigger>
                        <TabsTrigger value="professionalInfo">
                            Professional Information
                        </TabsTrigger>
                        <TabsTrigger value="accountInfo">
                            Account Information
                        </TabsTrigger>
                    </TabsList>
                    <form onSubmit={handleSubmit} >
                        <TabsContent value="personalInfo">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            disabled={generatedId !== ""}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">
                                            Date of Birth
                                        </Label>
                                        <Input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select
                                            name="gender"
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    value,
                                                    "gender"
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">
                                                    Male
                                                </SelectItem>
                                                <SelectItem value="female">
                                                    Female
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.contactInfo.phone}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="professionalInfo">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">
                                            Employee ID
                                        </Label>
                                        <Input
                                            id="employeeId"
                                            name="employeeId"
                                            value={formData.employeeId}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="educationalQualifications">
                                            Educational Qualifications
                                        </Label>
                                        <Input
                                            id="educationalQualifications"
                                            name="educationalQualifications"
                                            value={
                                                formData.educationalQualifications
                                            }
                                            onChange={handleInputChange}
                                            disabled={generatedId !== ""}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="yearsOfExperience">
                                            Years of Experience
                                        </Label>
                                        <Input
                                            id="yearsOfExperience"
                                            name="yearsOfExperience"
                                            type="number"
                                            value={formData.yearsOfExperience}
                                            onChange={handleInputChange}
                                            disabled={generatedId !== ""}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfJoining">
                                            Date of Joining
                                        </Label>
                                        <Input
                                            id="dateOfJoining"
                                            name="dateOfJoining"
                                            type="date"
                                            value={formData.dateOfJoining}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="accountInfo">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.contactInfo.email}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                            disabled={generatedId !== ""}
                                            onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                            disabled={generatedId !== ""}
                                            value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <div className="mt-6 space-y-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Generate Principal ID
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Tabs>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {generatedId && (
                    <div className="mt-4 space-y-2">
                        <Alert>
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>
                                Principal ID generated successfully:{" "}
                                <strong>{generatedId}</strong>
                            </AlertDescription>
                        </Alert>
                        <Button onClick={handleSendEmail} className="w-full">
                            <Send className="mr-2 h-4 w-4" />
                            Send Email with Authentication Data
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
        </div>
    );
};

export default Idgenerate;
