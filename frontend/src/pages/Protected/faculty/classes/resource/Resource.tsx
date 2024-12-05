import React, { useState, useEffect } from 'react';
import { Download, File, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';
import UploadOnCloudinary from '@/services/Cloudinary'; 

interface Resource {
    resource_id: number;
    title: string;
    description: string;
    file_url: string;
    resource_type: string;
    tags: string[];
    visibility: string;
    created_at: string;
}

const ResourcesTab = ({ courseId }: { courseId: number }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [fileUploading, setFileUploading] = useState(false);
    const mockResources: Resource[] = [
        {
            resource_id: 1,
            title: 'Introduction to React',
            description: 'A comprehensive guide to getting started with React.',
            file_url: 'https://example.com/react-intro.pdf',
            resource_type: 'application/pdf',
            tags: ['React', 'JavaScript', 'Frontend'],
            visibility: 'public',
            created_at: '2023-01-01T12:00:00Z'
        },
        {
            resource_id: 2,
            title: 'Advanced TypeScript',
            description: 'Deep dive into TypeScript features and best practices.',
            file_url: 'https://example.com/advanced-ts.pdf',
            resource_type: 'application/pdf',
            tags: ['TypeScript', 'JavaScript', 'Programming'],
            visibility: 'section',
            created_at: '2023-02-15T08:30:00Z'
        },
        {
            resource_id: 3,
            title: 'CSS Grid Layout',
            description: 'Learn how to create complex layouts with CSS Grid.',
            file_url: 'https://example.com/css-grid.pdf',
            resource_type: 'application/pdf',
            tags: ['CSS', 'Web Design', 'Frontend'],
            visibility: 'public',
            created_at: '2023-03-10T14:45:00Z'
        },
        {
            resource_id: 4,
            title: 'Node.js Performance Tips',
            description: 'Optimize your Node.js applications for better performance.',
            file_url: 'https://example.com/node-performance.pdf',
            resource_type: 'application/pdf',
            tags: ['Node.js', 'Backend', 'Performance'],
            visibility: 'section',
            created_at: '2023-04-05T10:20:00Z'
        }
    ];

    useEffect(() => {
        setResources(mockResources);
    }, []);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newResource, setNewResource] = useState({
        title: '',
        description: '',
        tags: '',
        visibility: 'section'
    });

    // File upload handler for documents (extending Cloudinary functionality)
    const handleDocUpload = async (file: File) => {
        setFileUploading(true);
        const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
                formData
            );
            return response.data.secure_url;
        } catch (error) {
            console.error('Error uploading document:', error);
            return null;
        }finally {
            setFileUploading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleCreateResource = async () => {
        if (!selectedFile) return;

        let fileUrl;
        const fileType = selectedFile.type;

        if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
            // Use existing Cloudinary upload for images and videos
            await UploadOnCloudinary({
                mediaFiles: [selectedFile],
                setuploadedImageMediaLinks: (urls) => { fileUrl = urls[0]; },
                setuploadedVideoMediaLinks: (urls) => { fileUrl = urls[0]; }
            });
        } else {
            // Use new document upload functionality
            fileUrl = await handleDocUpload(selectedFile);
        }

        if (!fileUrl) return;

        try {
            console.log(fileUrl);
            
            const response = await axios.post('/api/v1/resources', {
                title: newResource.title,
                description: newResource.description,
                file_url: fileUrl,
                resource_type: selectedFile.type,
                course_id: courseId,
                tags: newResource.tags.split(',').map(tag => tag.trim()),
                visibility: newResource.visibility
            });

            setResources([...resources, response.data]);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating resource:', error);
        }
    };

    const handleDeleteResource = async (resourceId: number) => {
        try {
            await axios.delete(`/api/v1/resources/${resourceId}`);
            setResources(resources.filter(r => r.resource_id !== resourceId));
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await axios.get(`/api/v1/resources/${courseId}`);
                setResources(response.data);
            } catch (error) {
                console.error('Error fetching resources:', error);
            }
        };

        fetchResources();
    }, [courseId]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                    <File className="mr-2 h-6 w-6" />
                    Resources
                </CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Resource
                </Button>
            </CardHeader>
            <CardContent>
                {mockResources.map((resource) => (
                    <div key={resource.resource_id} 
                         className="flex justify-between items-center p-3 bg-gray-100 rounded-lg mb-2">
                        <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-500">
                                {resource.description}
                            </p>
                            <div className="flex gap-2 mt-1">
                                {resource.tags.map((tag, index) => (
                                    <span key={index} 
                                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" 
                                    onClick={() => window.open(resource.file_url)}>
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" 
                                    onClick={() => handleDeleteResource(resource.resource_id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Title"
                            value={newResource.title}
                            onChange={(e) => setNewResource({
                                ...newResource,
                                title: e.target.value
                            })}
                        />
                        <Textarea
                            placeholder="Description"
                            value={newResource.description}
                            onChange={(e) => setNewResource({
                                ...newResource,
                                description: e.target.value
                            })}
                        />
                        <Input
                            placeholder="Tags (comma-separated)"
                            value={newResource.tags}
                            onChange={(e) => setNewResource({
                                ...newResource,
                                tags: e.target.value
                            })}
                        />
                        <Input
                            type="file"
                            onChange={handleFileSelect}
                        />
                        {fileUploading && (
                            <p className="text-sm text-gray-500">
                                Uploading file...
                            </p>
                        )}
                        <select
                            className="w-full p-2 border rounded"
                            value={newResource.visibility}
                            onChange={(e) => setNewResource({
                                ...newResource,
                                visibility: e.target.value
                            })}
                        >
                            <option value="section">Section Only</option>
                            <option value="public">Public</option>
                        </select>
                        <Button className="w-full" onClick={handleCreateResource}>
                            Upload Resource
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
export default ResourcesTab;