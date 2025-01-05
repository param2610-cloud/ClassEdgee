import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { domain } from "@/lib/constant";

const formSchema = z.object({
    fullName: z
        .string()
        .min(2, { message: "Full name must be at least 2 characters." }),
    dateOfBirth: z.date({ required_error: "Date of birth is required." }),
    gender: z.enum(["male", "female", "other"]),
    contactInfo: z.object({
        email: z.string().email({ message: "Invalid email address." }),
        phone: z
            .string()
            .min(10, { message: "Phone number must be at least 10 digits." }),
    }),
    address: z
        .string()
        .min(5, { message: "Address must be at least 5 characters." }),
    employeeId: z.string().min(1, { message: "Employee ID is required." }),
    educationalQualifications: z
        .string()
        .min(2, { message: "Educational qualifications are required." }),
    yearsOfExperience: z
        .number()
        .min(0, { message: "Years of experience must be a positive number." }),
    dateOfJoining: z.date({ required_error: "Date of joining is required." }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters." }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
    department: z.string().min(2, { message: "Department is required." }),
    reportingTo: z.string().min(1, { message: "Reporting to is required." }),
});

type FormData = z.infer<typeof formSchema>;

const CreateCoordinatorForm: React.FC = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            gender: "male",
            contactInfo: { email: "", phone: "" },
            address: "",
            employeeId: "",
            educationalQualifications: "",
            yearsOfExperience: 0,
            username: "",
            password: "",
            department: "",
            reportingTo: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${domain}/api/v1/coordinator/createcoordinator`,
                data
            );
            toast({
                title: "Success",
                description: "Coordinator created successfully!",
            });
            form.reset();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        error.response.data.message ||
                        "An error occurred while creating the coordinator.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "An unexpected error occurred.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem className="space-x-2">
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Controller
                                    name="dateOfBirth"
                                    control={form.control}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date | null) =>
                                                field.onChange(date)
                                            }
                                            dateFormat="MMMM d, yyyy"
                                            maxDate={new Date()}
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={100}
                                            placeholderText="Select date of birth"
                                            className="w-full p-2 border rounded"
                                        />
                                    )}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                        Female
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactInfo.email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactInfo.phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="1234567890"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your address"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                                <Input placeholder="EMP001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="educationalQualifications"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Educational Qualifications</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your educational qualifications"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) =>
                                        field.onChange(parseInt(e.target.value))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dateOfJoining"
                    render={({ field }) => (
                        <FormItem className="space-x-2">
                            <FormLabel>Date of Joining</FormLabel>
                            <FormControl>
                                <Controller
                                    name="dateOfJoining"
                                    control={form.control}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date | null) =>
                                                field.onChange(date)
                                            }
                                            dateFormat="MMMM d, yyyy"
                                            maxDate={new Date()}
                                            showYearDropdown
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={100}
                                            placeholderText="Select date of joining"
                                            className="w-full p-2 border rounded"
                                        />
                                    )}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Password must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter department"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reportingTo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reporting To</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter reporting principal's ID"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Coordinator"}
                </Button>
            </form>
        </Form>
    );
};

export default CreateCoordinatorForm;
