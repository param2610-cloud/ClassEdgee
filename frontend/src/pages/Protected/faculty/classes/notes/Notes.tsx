import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared";
import { getNotes, uploadNote } from "@/api/classes.api";
import { useAuth } from "@/hooks/useAuth";

interface NotesTabProps {
    courseId: number;
    sectionId?: number;
    readOnly?: boolean;
}

const parseTags = (value: string): string[] =>
    value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

const emptyForm = { title: "", content: "", tags: "", isPrivate: false };

const NotesTab = ({ courseId, sectionId, readOnly = false }: NotesTabProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newNote, setNewNote] = useState(emptyForm);

    const notesQuery = useQuery({
        queryKey: ["class-notes", courseId],
        queryFn: () => getNotes(courseId),
        enabled: Boolean(courseId),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            uploadNote({
                title: newNote.title,
                content: newNote.content,
                courseId,
                createdBy: user!.user_id!,
                sectionId,
                tags: parseTags(newNote.tags),
                isPrivate: newNote.isPrivate,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["class-notes", courseId] });
            setNewNote(emptyForm);
            setIsCreateModalOpen(false);
        },
    });

    const notes = notesQuery.data ?? [];

    const renderContent = () => {
        if (notesQuery.isLoading) {
            return <LoadingSkeleton variant="card" rows={4} />;
        }

        if (notesQuery.isError) {
            return (
                <ErrorState
                    message="Failed to load class notes."
                    onRetry={() => { notesQuery.refetch(); }}
                />
            );
        }

        if (notes.length === 0) {
            return (
                <EmptyState
                    icon={BookOpen}
                    title="No notes available"
                    description={
                        readOnly
                            ? "Faculty has not published any notes yet."
                            : "Create the first note for this class."
                    }
                    action={
                        readOnly ? null : (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Note
                            </Button>
                        )
                    }
                />
            );
        }

        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {notes.map((note) => (
                    <Card key={note.note_id} className="h-full">
                        <CardHeader className="pb-2">
                            <h3 className="font-semibold">{note.title}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{note.content}</p>
                            {note.tags?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {note.tags.map((tag) => (
                                        <span
                                            key={`${note.note_id}-${tag}`}
                                            className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Notes
                </CardTitle>
                {!readOnly ? (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Note
                    </Button>
                ) : null}
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>

            {!readOnly ? (
                <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={(open) => {
                        setIsCreateModalOpen(open);
                        if (!open) setNewNote(emptyForm);
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Note</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={newNote.title}
                                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                            />
                            <Textarea
                                placeholder="Content"
                                value={newNote.content}
                                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                            />
                            <Input
                                placeholder="Tags (comma-separated)"
                                value={newNote.tags}
                                onChange={(e) => setNewNote((prev) => ({ ...prev, tags: e.target.value }))}
                            />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={newNote.isPrivate}
                                    onChange={(e) => setNewNote((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                                />
                                Private note
                            </label>
                            <Button
                                className="w-full"
                                disabled={createMutation.isPending || !newNote.title.trim() || !newNote.content.trim()}
                                onClick={() => { createMutation.mutate(); }}
                            >
                                {createMutation.isPending ? "Saving..." : "Create Note"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : null}
        </Card>
    );
};

export default NotesTab;
