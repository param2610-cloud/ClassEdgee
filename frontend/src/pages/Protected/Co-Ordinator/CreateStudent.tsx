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
    studentId: z.string().min(1, { message: "Student ID is required." }),
    grade: z.string().min(1, { message: "Grade is required." }),
    dateOfEnrollment: z.date({
        required_error: "Date of enrollment is required.",
    }),
    guardianName: z
        .string()
        .min(2, { message: "Guardian's name must be at least 2 characters." }),
    guardianContact: z
        .string()
        .min(10, { message: "Guardian's phone number must be at least 10 digits." }),
});

type FormData = z.infer<typeof formSchema>;

const CreateStudentForm: React.FC = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            gender: "male",
            contactInfo: { email: "", phone: "" },
            address: "",
            studentId: "",
            grade: "",
            guardianName: "",
            guardianContact: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${domain}/api/v1/student/create`,
                data
            );
            toast({
                title: "Success",
                description: "Student created successfully!",
            });
            form.reset();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        error.response.data.message ||
                        "An error occurred while creating the student.",
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
                                    <SelectItem value="female">Female</SelectItem>
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
                    name="studentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student ID</FormLabel>
                            <FormControl>
                                <Input placeholder="STU001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter grade" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dateOfEnrollment"
                    render={({ field }) => (
                        <FormItem className="space-x-2">
                            <FormLabel>Date of Enrollment</FormLabel>
                            <FormControl>
                                <Controller
                                    name="dateOfEnrollment"
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
                                            placeholderText="Select date of enrollment"
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
                    name="guardianName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Guardian's Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter guardian's name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="guardianContact"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Guardian's Contact</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="Enter guardian's phone number"
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

export default CreateStudentForm;








