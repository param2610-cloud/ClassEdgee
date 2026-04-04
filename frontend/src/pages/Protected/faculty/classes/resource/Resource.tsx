import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared";
import {
    ClassResource,
    deleteResource,
    getResources,
    uploadResource,
} from "@/api/classes.api";
import { useAuth } from "@/hooks/useAuth";
import { domain } from "@/lib/constant";

interface ResourcesTabProps {
    courseId: number;
    readOnly?: boolean;
}

const parseTags = (value: string): string[] =>
    value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

const resolveResourceUrl = (fileUrl?: string): string | null => {
    if (!fileUrl) return null;
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    if (fileUrl.startsWith("/")) return `${domain}${fileUrl}`;
    return `${domain}/${fileUrl}`;
};

const ResourcesTab = ({ courseId, readOnly = false }: ResourcesTabProps) => {
    const { user } = useAuth();
    const [resources, setResources] = useState<ClassResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newResource, setNewResource] = useState({
        title: "",
        description: "",
        tags: "",
        visibility: "section",
    });

    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const data = await getResources(courseId);
            setResources(data);
        } catch {
            setErrorMessage("Failed to load class resources.");
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        void fetchResources();
    }, [fetchResources]);

    const resetCreateForm = () => {
        setNewResource({
            title: "",
            description: "",
            tags: "",
            visibility: "section",
        });
        setSelectedFile(null);
    };

    const handleCreateResource = async () => {
        if (!selectedFile || !user?.user_id) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const created = await uploadResource({
                title: newResource.title,
                description: newResource.description,
                courseId,
                uploadedBy: user.user_id,
                file: selectedFile,
                tags: parseTags(newResource.tags),
                visibility: newResource.visibility,
            });

            setResources((prev) => [created, ...prev]);
            resetCreateForm();
            setIsCreateModalOpen(false);
        } catch {
            setErrorMessage("Failed to upload resource.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteResource = async (resourceId: number) => {
        setErrorMessage(null);

        try {
            await deleteResource(resourceId);
            setResources((prev) => prev.filter((item) => item.resource_id !== resourceId));
        } catch {
            setErrorMessage("Failed to delete resource.");
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton variant="list" rows={4} />;
        }

        if (errorMessage) {
            return <ErrorState message={errorMessage} onRetry={fetchResources} />;
        }

        if (resources.length === 0) {
            return (
                <EmptyState
                    icon={FileText}
                    title="No resources uploaded"
                    description={
                        readOnly
                            ? "Faculty has not uploaded resources for this class yet."
                            : "Upload the first class resource to help students prepare."
                    }
                    action={
                        readOnly ? null : (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Resource
                            </Button>
                        )
                    }
                />
            );
        }

        return (
            <div className="space-y-3">
                {resources.map((resource) => {
                    const fileUrl = resolveResourceUrl(resource.file_url);

                    return (
                        <div
                            key={resource.resource_id}
                            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">{resource.title}</p>
                                {resource.description ? (
                                    <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
                                ) : null}
                                {resource.tags?.length ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {resource.tags.map((tag) => (
                                            <span
                                                key={`${resource.resource_id}-${tag}`}
                                                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={!fileUrl}
                                    onClick={() => {
                                        if (fileUrl) {
                                            window.open(fileUrl, "_blank", "noopener,noreferrer");
                                        }
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                {!readOnly ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            void handleDeleteResource(resource.resource_id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-6 w-6" />
                    Resources
                </CardTitle>
                {!readOnly ? (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>

            {!readOnly ? (
                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={(open) => {
                        setIsCreateModalOpen(open);
                        if (!open) {
                            resetCreateForm();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Resource</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={newResource.title}
                                onChange={(e) =>
                                    setNewResource((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                            />
                            <Textarea
                                placeholder="Description"
                                value={newResource.description}
                                onChange={(e) =>
                                    setNewResource((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder="Tags (comma-separated)"
                                value={newResource.tags}
                                onChange={(e) =>
                                    setNewResource((prev) => ({
                                        ...prev,
                                        tags: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="file"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setSelectedFile(file);
                                }}
                            />
                            <select
                                className="w-full rounded-md border p-2"
                                value={newResource.visibility}
                                onChange={(e) =>
                                    setNewResource((prev) => ({
                                        ...prev,
                                        visibility: e.target.value,
                                    }))
                                }
                            >
                                <option value="section">Section Only</option>
                                <option value="public">Public</option>
                            </select>
                            <Button
                                className="w-full"
                                disabled={isSaving || !selectedFile || !newResource.title.trim()}
                                onClick={() => {
                                    void handleCreateResource();
                                }}
                            >
                                {isSaving ? "Uploading..." : "Upload Resource"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : null}
        </Card>
    );
};

export default ResourcesTab;