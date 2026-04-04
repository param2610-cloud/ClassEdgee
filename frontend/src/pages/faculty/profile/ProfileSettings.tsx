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
  getFacultyByUserId,
  getFacultyDepartments,
  updateCoordinatorFaculty,
} from "@/api/faculty.api";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(8, "Phone number is required"),
  departmentId: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  expertise: z.string().optional(),
  qualifications: z.string().optional(),
  maxWeeklyHours: z.coerce.number().min(1).max(80),
  contractEndDate: z.string().optional(),
  researchInterests: z.string().optional(),
  publications: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const toCsv = (value: unknown) => {
  if (!Array.isArray(value)) return "";
  return value.filter(Boolean).join(", ");
};

const fromCsv = (value?: string) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

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

const ProfileSettings = () => {
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
      designation: "",
      expertise: "",
      qualifications: "",
      maxWeeklyHours: 40,
      contractEndDate: "",
      researchInterests: "",
      publications: "",
    },
  });

  const facultyQuery = useQuery({
    queryKey: ["faculty-profile", user?.user_id],
    queryFn: () => getFacultyByUserId(Number(user?.user_id)),
    enabled: Boolean(user?.user_id),
  });

  const departmentQuery = useQuery({
    queryKey: ["faculty-profile-departments", user?.institution_id],
    queryFn: () => getFacultyDepartments(Number(user?.institution_id)),
    enabled: Boolean(user?.institution_id),
  });

  useEffect(() => {
    const data = facultyQuery.data;
    if (!data) return;

    setValue("firstName", data.first_name || "");
    setValue("lastName", data.last_name || "");
    setValue("email", data.email || "");
    setValue("phoneNumber", data.phone_number || "");
    setValue("departmentId", data.faculty?.department_id ? String(data.faculty.department_id) : "");
    setValue("designation", data.faculty?.designation || "");
    setValue("expertise", toCsv(data.faculty?.expertise));
    setValue("qualifications", toCsv(data.faculty?.qualifications));
    setValue("maxWeeklyHours", Number(data.faculty?.max_weekly_hours || 40));
    setValue("contractEndDate", toDateInput(data.faculty?.contract_end_date));
    setValue("researchInterests", toCsv(data.faculty?.research_interests));
    setValue("publications", toCsv(data.faculty?.publications));
    setUploadedImageUrl(data.profile_picture || "");
  }, [facultyQuery.data, setValue]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!user?.user_id) {
        throw new Error("Unauthorized user");
      }

      return updateCoordinatorFaculty(user.user_id, {
        user: {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone_number: values.phoneNumber,
          profile_picture: uploadedImageUrl || undefined,
        },
        faculty: {
          department_id: Number(values.departmentId),
          designation: values.designation,
          expertise: fromCsv(values.expertise),
          qualifications: fromCsv(values.qualifications),
          max_weekly_hours: Number(values.maxWeeklyHours),
          contract_end_date: values.contractEndDate || null,
          research_interests: fromCsv(values.researchInterests),
          publications: fromCsv(values.publications),
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Faculty profile changes have been saved.",
      });
      facultyQuery.refetch();
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

  if (facultyQuery.isLoading) {
    return <LoadingSkeleton variant="card" rows={3} />;
  }

  if (facultyQuery.error) {
    return (
      <ErrorState
        message="Failed to load faculty profile"
        onRetry={() => {
          facultyQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile Settings"
        description="Manage faculty profile details, expertise, and profile photo."
        breadcrumbs={[{ label: "Faculty", href: "/faculty" }, { label: "Profile" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Faculty Profile</CardTitle>
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
                  {(departmentQuery.data ?? []).map((department) => (
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
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" {...register("designation")} />
              {errors.designation ? <p className="text-xs text-red-600">{errors.designation.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expertise">Expertise Tags (comma separated)</Label>
              <Input id="expertise" {...register("expertise")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
              <Input id="qualifications" {...register("qualifications")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWeeklyHours">Max Weekly Hours</Label>
              <Input id="maxWeeklyHours" type="number" min={1} max={80} {...register("maxWeeklyHours")} />
              {errors.maxWeeklyHours ? (
                <p className="text-xs text-red-600">{errors.maxWeeklyHours.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractEndDate">Contract End Date</Label>
              <Input id="contractEndDate" type="date" {...register("contractEndDate")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="researchInterests">Research Interests (comma separated)</Label>
              <Input id="researchInterests" {...register("researchInterests")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="publications">Publications (comma separated)</Label>
              <Input id="publications" {...register("publications")} />
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

export default ProfileSettings;
