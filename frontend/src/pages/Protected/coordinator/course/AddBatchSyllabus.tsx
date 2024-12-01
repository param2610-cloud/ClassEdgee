import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Upload, Loader2 } from "lucide-react";
import axios from 'axios';
import { domain } from '@/lib/constant';

interface SubjectData {
    subject_name: string;
    subject_code: string;
    subject_type: string;
    preferred_faculty_specializations?: string[];
    resources_required?: string[];
    units: {
        unit_number: number;
        unit_name: string;
        required_hours: number;
        unit_type?: string;
        topics: {
            topic_name: string;
            topic_description?: string;
        }[];
    }[];
}

const BatchUploadComponent: React.FC = () => {
    const { course_id, department_id } = useParams<{ course_id: string; department_id: string }>();
    
    const [semester, setSemester] = useState<string>('');
    const [batchJson, setBatchJson] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Example JSON structure for reference
    const exampleJson = {
        "Mathematics": {
            subject_name: "Advanced Mathematics",
            subject_code: "MATH101",
            subject_type: "Core",
            preferred_faculty_specializations: ["Applied Mathematics", "Theoretical Mathematics"],
            resources_required: ["Scientific Calculator", "Reference Textbooks"],
            units: [
                {
                    unit_number: 1,
                    unit_name: "Linear Algebra",
                    required_hours: 15,
                    unit_type: "Theoretical",
                    topics: [
                        {
                            topic_name: "Vector Spaces",
                            topic_description: "Introduction to vector spaces and linear transformations"
                        },
                        {
                            topic_name: "Matrix Operations",
                            topic_description: "Advanced matrix manipulations and properties"
                        }
                    ]
                }
            ]
        }
    };

    const handleSubmit = async () => {
        // Reset previous states
        setValidationError('');
        setUploadSuccess(false);
        setUploadError('');
        setIsLoading(true);

        // Validate inputs
        if (!semester) {
            setValidationError('Semester is required');
            setIsLoading(false);
            return;
        }

        try {
            // Validate JSON
            const semesterData = JSON.parse(batchJson);
            
            // Basic structure validation
            if (typeof semesterData !== 'object' || Object.keys(semesterData).length === 0) {
                throw new Error('Invalid JSON structure');
            }

            // Prepare request payload
            const payload = {
                department_id: parseInt(department_id!, 10),
                course_id: parseInt(course_id!, 10),
                semester: parseInt(semester),
                subjects: semesterData
            };

            // Send request to backend
            const response = await axios.post(`${domain}/api/v1/curriculum/batch`, payload);
            
            // Handle successful upload
            setUploadSuccess(true);
            setUploadError('');
        } catch (error) {
            // Handle validation or upload errors
            if (error instanceof SyntaxError) {
                setValidationError('Invalid JSON format. Please check your input.');
            } else if (axios.isAxiosError(error)) {
                setUploadError(error.response?.data?.error || 'Upload failed. Please try again.');
            } else {
                setUploadError('An unexpected error occurred.');
            }
            setUploadSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Batch Syllabus Upload</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Semester Input */}
                        <div>
                            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                                Semester
                            </label>
                            <Input 
                                id="semester"
                                type="text" 
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                placeholder="Enter semester (e.g., 1, 2, 3)"
                                className="mt-1"
                                disabled={isLoading}
                            />
                        </div>

                        {/* JSON Input Guide */}
                        <Alert variant="default">
                            <Info className="h-4 w-4" />
                            <AlertTitle>JSON Input Guide</AlertTitle>
                            <AlertDescription>
                                Please enter syllabus data in the following JSON format:
                                <pre className="bg-gray-100 p-2 mt-2 rounded text-sm overflow-x-auto">
                                    {JSON.stringify(exampleJson, null, 2)}
                                </pre>
                            </AlertDescription>
                        </Alert>

                        {/* JSON Textarea */}
                        <Textarea
                            placeholder="Paste your batch syllabus JSON here"
                            value={batchJson}
                            onChange={(e) => setBatchJson(e.target.value)}
                            className="min-h-[300px]"
                            disabled={isLoading}
                        />

                        {/* Validation Error */}
                        {validationError && (
                            <div className="text-red-500 text-sm">
                                {validationError}
                            </div>
                        )}

                        {/* Upload Error */}
                        {uploadError && (
                            <div className="text-red-500 text-sm">
                                {uploadError}
                            </div>
                        )}

                        {/* Upload Success */}
                        {uploadSuccess && (
                            <div className="text-green-600 text-sm">
                                Syllabus uploaded successfully!
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button 
                            onClick={handleSubmit} 
                            className="w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Batch Syllabus
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BatchUploadComponent;