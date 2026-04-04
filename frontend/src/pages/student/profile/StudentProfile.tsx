import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Save, Upload } from "lucide-react";
import { PageHeader, ErrorState, LoadingSkeleton } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentStudent,
  getDepartmentsForInstitution,
  updateCoordinatorStudent,
} from "@/api/student.api";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(8, "Phone number is required"),
  departmentId: z.string().min(1, "Department is required"),
  enrollmentNumber: z.string().min(1, "Enrollment number is required"),
  batchYear: z.coerce.number().min(2000).max(2100),
  currentSemester: z.coerce.number().min(1).max(12),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianContact: z.string().min(8, "Guardian contact is required"),
  collegeUid: z.string().min(1, "College UID is required"),
});

type FormValues = z.infer<typeof schema>;

const uploadProfileImage = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const secureUrl = response.data?.secure_url;
  if (!secureUrl) {
    throw new Error("Failed to upload profile image");
  }

  return secureUrl;
};

const StudentProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      departmentId: "",
      enrollmentNumber: "",
      batchYear: new Date().getFullYear(),
      currentSemester: 1,
      guardianName: "",
      guardianContact: "",
      collegeUid: "",
    },
  });

  const studentQuery = useQuery({
    queryKey: ["student-profile", user?.user_id],
    queryFn: () => getCurrentStudent(Number(user?.user_id)),
    enabled: Boolean(user?.user_id),
  });

  const departmentsQuery = useQuery({
    queryKey: ["student-profile-departments", user?.institution_id],
    queryFn: () => getDepartmentsForInstitution(Number(user?.institution_id)),
    enabled: Boolean(user?.institution_id),
  });

  useEffect(() => {
    const data = studentQuery.data;
    if (!data) return;

    setValue("firstName", data.first_name || "");
    setValue("lastName", data.last_name || "");
    setValue("email", data.email || "");
    setValue("phoneNumber", data.phone_number || "");
    setValue("departmentId", data.students?.department_id ? String(data.students.department_id) : "");
    setValue("enrollmentNumber", data.students?.enrollment_number || "");
    setValue("batchYear", Number(data.students?.batch_year || new Date().getFullYear()));
    setValue("currentSemester", Number(data.students?.current_semester || 1));
    setValue("guardianName", data.students?.guardian_name || "");
    setValue("guardianContact", data.students?.guardian_contact || "");
    setValue("collegeUid", data.college_uid || "");
    setUploadedImageUrl(data.profile_picture || "");
  }, [studentQuery.data, setValue]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!user?.user_id) {
        throw new Error("Unauthorized user");
      }

      return updateCoordinatorStudent(user.user_id, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        departmentId: Number(values.departmentId),
        enrollmentNumber: values.enrollmentNumber,
        batchYear: Number(values.batchYear),
        currentSemester: Number(values.currentSemester),
        guardianName: values.guardianName,
        guardianContact: values.guardianContact,
        collegeUid: values.collegeUid,
        profilePictureUrl: uploadedImageUrl || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Student profile has been updated successfully.",
      });
      studentQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update profile",
        variant: "destructive",
      });
    },
  });

  const currentImage = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }

    return uploadedImageUrl || "";
  }, [selectedImage, uploadedImageUrl]);

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setImageUploading(true);

    try {
      const url = await uploadProfileImage(selectedImage);
      setUploadedImageUrl(url);
      setSelectedImage(null);
      toast({
        title: "Image uploaded",
        description: "Profile photo is ready to save.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  if (studentQuery.isLoading) {
    return <LoadingSkeleton variant="card" rows={3} />;
  }

  if (studentQuery.error) {
    return (
      <ErrorState
        message="Failed to load student profile"
        onRetry={() => {
          studentQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Student Profile"
        description="Update personal and academic profile details."
        breadcrumbs={[{ label: "Student", href: "/student" }, { label: "Profile" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit((values) => {
              updateMutation.mutate(values);
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName ? <p className="text-xs text-red-600">{errors.firstName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName ? <p className="text-xs text-red-600">{errors.lastName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...register("phoneNumber")} />
              {errors.phoneNumber ? (
                <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={watch("departmentId")}
                onValueChange={(value) => {
                  setValue("departmentId", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(departmentsQuery.data ?? []).map((department) => (
                    <SelectItem key={department.department_id} value={String(department.department_id)}>
                      {department.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId ? (
                <p className="text-xs text-red-600">{errors.departmentId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
              <Input id="enrollmentNumber" {...register("enrollmentNumber")} />
              {errors.enrollmentNumber ? (
                <p className="text-xs text-red-600">{errors.enrollmentNumber.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchYear">Batch Year</Label>
              <Input id="batchYear" type="number" {...register("batchYear")} />
              {errors.batchYear ? <p className="text-xs text-red-600">{errors.batchYear.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSemester">Current Semester</Label>
              <Input id="currentSemester" type="number" {...register("currentSemester")} />
              {errors.currentSemester ? (
                <p className="text-xs text-red-600">{errors.currentSemester.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input id="guardianName" {...register("guardianName")} />
              {errors.guardianName ? (
                <p className="text-xs text-red-600">{errors.guardianName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <Input id="guardianContact" {...register("guardianContact")} />
              {errors.guardianContact ? (
                <p className="text-xs text-red-600">{errors.guardianContact.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="collegeUid">College UID</Label>
              <Input id="collegeUid" {...register("collegeUid")} />
              {errors.collegeUid ? <p className="text-xs text-red-600">{errors.collegeUid.message}</p> : null}
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label>Profile Photo</Label>
              <div className="flex flex-wrap items-center gap-3">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Profile preview"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">
                    No Photo
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedImage(file);
                  }}
                  className="max-w-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedImage || imageUploading}
                  onClick={() => {
                    void handleImageUpload();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imageUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending || imageUploading}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
