import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { domain } from "@/lib/constant";

interface Duration {
  startDate: string;
  endDate: string;
}

interface TeacherFormData {
  personalInformation: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactNumber: string;
    email: string;
  };
  qualification: {
    highestDegree: string;
    specialization: string;
    universityInstitute: string;
    yearOfPassing: number;
  };
  professionalExperience: {
    totalYearsOfExperience: number;
    previousJobTitle: string;
    previousOrganization: string;
    duration: Duration;
  };
  subjectExpertise: {
    primarySubject: string;
    secondarySubjects: string;
  };
  additionalInformation: {
    address: string;
  };
  certifications: File[];
  linkedinProfile: string;
}

const CreateTeacher: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>();

  const onSubmit = async (data: TeacherFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`${domain}/api/teachers`, data);
      setSuccess("Teacher created successfully.");
    } catch (error) {
      setError("Failed to create teacher.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Handle bulk file upload logic here
      setSuccess("File uploaded successfully.");
    } catch (error) {
      setError("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Teacher</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Personal Information */}
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register("personalInformation.fullName", {
                  required: "Full name is required",
                })}
                className={errors.personalInformation?.fullName ? "border-red-500" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  type="date"
                  id="dateOfBirth"
                  {...register("personalInformation.dateOfBirth", {
                    required: "Date of birth is required",
                  })}
                  className={errors.personalInformation?.dateOfBirth ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Input
                  id="gender"
                  {...register("personalInformation.gender", {
                    required: "Gender is required",
                  })}
                  className={errors.personalInformation?.gender ? "border-red-500" : ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  {...register("personalInformation.contactNumber", {
                    required: "Contact number is required",
                  })}
                  className={errors.personalInformation?.contactNumber ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  {...register("personalInformation.email", {
                    required: "Email is required",
                  })}
                  className={errors.personalInformation?.email ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* Qualification */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="highestDegree">Highest Degree *</Label>
                <Input
                  id="highestDegree"
                  {...register("qualification.highestDegree", {
                    required: "Highest degree is required",
                  })}
                  className={errors.qualification?.highestDegree ? "border-red-500" : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    {...register("qualification.specialization", {
                      required: "Specialization is required",
                    })}
                    className={errors.qualification?.specialization ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="universityInstitute">University/Institute *</Label>
                  <Input
                    id="universityInstitute"
                    {...register("qualification.universityInstitute", {
                      required: "University/Institute is required",
                    })}
                    className={errors.qualification?.universityInstitute ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="yearOfPassing">Year of Passing *</Label>
                <Input
                  type="number"
                  id="yearOfPassing"
                  {...register("qualification.yearOfPassing", {
                    required: "Year of passing is required",
                  })}
                  className={errors.qualification?.yearOfPassing ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* Professional Experience */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="totalYearsOfExperience">Total Years of Experience *</Label>
                <Input
                  type="number"
                  id="totalYearsOfExperience"
                  {...register("professionalExperience.totalYearsOfExperience", {
                    required: "Total years of experience is required",
                  })}
                  className={errors.professionalExperience?.totalYearsOfExperience ? "border-red-500" : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="previousJobTitle">Previous Job Title *</Label>
                  <Input
                    id="previousJobTitle"
                    {...register("professionalExperience.previousJobTitle", {
                      required: "Previous job title is required",
                    })}
                    className={errors.professionalExperience?.previousJobTitle ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="previousOrganization">Previous Organization *</Label>
                  <Input
                    id="previousOrganization"
                    {...register("professionalExperience.previousOrganization", {
                      required: "Previous organization is required",
                    })}
                    className={errors.professionalExperience?.previousOrganization ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    type="date"
                    id="startDate"
                    {...register("professionalExperience.duration.startDate", {
                      required: "Start date is required",
                    })}
                    className={errors.professionalExperience?.duration?.startDate ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    type="date"
                    id="endDate"
                    {...register("professionalExperience.duration.endDate", {
                      required: "End date is required",
                    })}
                    className={errors.professionalExperience?.duration?.endDate ? "border-red-500" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Subject Expertise */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="primarySubject">Primary Subject *</Label>
                <Input
                  id="primarySubject"
                  {...register("subjectExpertise.primarySubject", {
                    required: "Primary subject is required",
                  })}
                  className={errors.subjectExpertise?.primarySubject ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label htmlFor="secondarySubjects">Secondary Subjects</Label>
                <Input
                  id="secondarySubjects"
                  {...register("subjectExpertise.secondarySubjects")}
                  className={errors.subjectExpertise?.secondarySubjects ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...register("additionalInformation.address", {
                    required: "Address is required",
                  })}
                  className={errors.additionalInformation?.address ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label htmlFor="linkedinProfile">LinkedIn Profile *</Label>
                <Input
                  id="linkedinProfile"
                  {...register("linkedinProfile", {
                    required: "LinkedIn profile is required",
                  })}
                  className={errors.linkedinProfile ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* File Upload for Certifications */}
            <div className="space-y-4">
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                type="file"
                id="certifications"
                {...register("certifications")}
                multiple
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Create Teacher"}
            </Button>

            {/* Display Success/Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTeacher;
