import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {  useToast } from "@/hooks/use-toast"; 
import { Faculty } from "@/interface/general";
import { domain } from "@/lib/constant";

// Zod validation schema
const departmentSchema = z.object({
    department_name: z.string().min(2, {
        message: "Department name must be at least 2 characters.",
    }),
    department_code: z.string().min(2, {
        message: "Department code must be at least 2 characters.",
    }),
    hod_college_uid: z.string().optional(),
});

const AddDepartmentForm = () => {
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const {toast} = useToast()
    // Fetch faculty list on component mount
    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const response = await fetch(`${domain}/api/v1/faculty/list-of-faculty`);
                if (!response.ok) {
                    throw new Error("Failed to fetch faculty");
                }
                const data = await response.json();
                setFacultyList(data.facultys || []);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Could not fetch faculty list",
                    variant: "destructive",
                });
            }
        };

        fetchFaculty();
    }, []);

    // Initialize form with react-hook-form and zod
    const form = useForm({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            department_name: "",
            department_code: "",
            hod_college_uid: "",
        },
    });

    // Form submission handler
    const onSubmit = async (data: z.infer<typeof departmentSchema>) => {
        try {
            const response = await fetch(`${domain}/api/v1/coordinator/add-department`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            console.log(response);
            
            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Department added successfully",
                });
                // Reset form after successful submission
                form.reset();
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description:
                        errorData.message || "Failed to add department",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Add New Department
            </h2>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* Department Name Field */}
                    <FormField
                        control={form.control}
                        name="department_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter department name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Department Code Field */}
                    <FormField
                        control={form.control}
                        name="department_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department Code</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter department code"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* HOD Selection Field */}
                    <FormField
                        control={form.control}
                        name="hod_college_uid"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Head of Department (Optional)
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select HOD" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {facultyList.map((faculty:Faculty) => (
                                            faculty.users &&
                                            <SelectItem
                                                key={faculty.user_id}
                                                value={
                                                    faculty.users.college_uid
                                                }
                                            >
                                                {faculty.users?.first_name + " " + faculty.users?.last_name ||
                                                    faculty.users.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Optional: Select the Head of Department
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full">
                        Add Department
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddDepartmentForm;
