import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, Loader, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { domain } from "@/lib/constant";
import UploadOnCloudinary from "@/services/Cloudinary";

// Types based on your Prisma schema
interface FacultyProfile {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone_number?: string;
        profile_picture?: string;
    };
    faculty: {
        department_id?: number;
        designation: string;
        expertise: string[];
        qualifications: string[];
        max_weekly_hours?: number;
        contract_end_date?: string;
        research_interests: string[];
        publications: string[];
    };
}

const FacultyEditProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FacultyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadedImageLinks, setUploadedImageLinks] = useState<string[]>([]);

    // Fetch faculty data
    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const response = await axios.get(`${domain}/api/v1/faculty/get-faculty/${id}`);
                const { data } = response.data;
                
                // Transform the data to match our form structure
                setFormData({
                    user: {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone_number: data.phone_number || '',
                        profile_picture: data.profile_picture
                    },
                    faculty: {
                        department_id: data.faculty?.department_id,
                        designation: data.faculty?.designation || '',
                        expertise: data.faculty?.expertise || [],
                        qualifications: data.faculty?.qualifications || [],
                        max_weekly_hours: data.faculty?.max_weekly_hours,
                        contract_end_date: data.faculty?.contract_end_date,
                        research_interests: data.faculty?.research_interests || [],
                        publications: data.faculty?.publications || []
                    }
                });
                setLoading(false);
            } catch (err) {
                setError("Error fetching faculty details");
                setLoading(false);
            }
        };
        fetchFaculty();
    }, [id]);

    // Update profile picture when image is uploaded
    useEffect(() => {
        if (uploadedImageLinks.length > 0) {
            const lastUploadedImage = uploadedImageLinks[uploadedImageLinks.length - 1];
            handleChange({
                target: {
                    name: 'user.profile_picture',
                    value: lastUploadedImage
                }
            });
        }
    }, [uploadedImageLinks]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }
    ) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        
        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [section]: {
                    ...prev[section as keyof FacultyProfile],
                    [field]: value,
                },
            };
        });
        setIsChanged(true);
    };

    const handleArrayInput = (field: string, value: string) => {
        const [section, arrayField] = field.split('.');
        const values = value.split(',').map(item => item.trim()).filter(Boolean);
        
        handleChange({
            target: {
                name: `${section}.${arrayField}`,
                value: values
            }
        });
    };
    const [uploading,setuploading] = useState<boolean>(false)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        
        try {
            setuploading(true)
            setError(null);
            const mediaFiles = Array.from(e.target.files);
            await UploadOnCloudinary({
                mediaFiles,
                setuploadedImageMediaLinks: setUploadedImageLinks,
                setuploadedVideoMediaLinks: () => {}, // We don't need video upload for profile
            });
        } catch (err) {
            setError('Error uploading image');
        }finally{
            setuploading(false)
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.put(`${domain}/api/v1/faculty/edit/${id}`, formData);
            setSuccess("Faculty profile updated successfully");
            setIsChanged(false);
        } catch (err) {
            setError("Error updating faculty profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!formData) return <div>No faculty data found</div>;

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Faculty Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Profile Image */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img
                                src={formData.user.profile_picture || '/placeholder-avatar.png'}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <label className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer">
                                {uploading?<Loader className="w-4 h-4 text-white animate-spin" />:<Camera className="w-4 h-4 text-white" />}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={saving}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                name="user.first_name"
                                value={formData.user.first_name}
                                onChange={handleChange}
                                placeholder="First Name"
                                required
                            />
                            <Input
                                name="user.last_name"
                                value={formData.user.last_name}
                                onChange={handleChange}
                                placeholder="Last Name"
                                required
                            />
                            <Input
                                name="user.email"
                                value={formData.user.email}
                                onChange={handleChange}
                                placeholder="Email"
                                type="email"
                                required
                            />
                            <Input
                                name="user.phone_number"
                                value={formData.user.phone_number}
                                onChange={handleChange}
                                placeholder="Phone Number"
                            />
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                name="faculty.designation"
                                value={formData.faculty.designation}
                                onChange={handleChange}
                                placeholder="Designation"
                                required
                            />
                            <Input
                                name="faculty.max_weekly_hours"
                                type="number"
                                value={formData.faculty.max_weekly_hours || ''}
                                onChange={handleChange}
                                placeholder="Max Weekly Hours"
                            />
                            <div className="col-span-2">
                                <Input
                                    name="faculty.expertise"
                                    value={formData.faculty.expertise.join(', ')}
                                    onChange={(e) => handleArrayInput('faculty.expertise', e.target.value)}
                                    placeholder="Areas of Expertise (comma-separated)"
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    name="faculty.qualifications"
                                    value={formData.faculty.qualifications.join(', ')}
                                    onChange={(e) => handleArrayInput('faculty.qualifications', e.target.value)}
                                    placeholder="Qualifications (comma-separated)"
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    name="faculty.research_interests"
                                    value={formData.faculty.research_interests.join(', ')}
                                    onChange={(e) => handleArrayInput('faculty.research_interests', e.target.value)}
                                    placeholder="Research Interests (comma-separated)"
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    name="faculty.publications"
                                    value={formData.faculty.publications.join(', ')}
                                    onChange={(e) => handleArrayInput('faculty.publications', e.target.value)}
                                    placeholder="Publications (comma-separated)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isChanged || saving}
                            className={!isChanged ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default FacultyEditProfile;