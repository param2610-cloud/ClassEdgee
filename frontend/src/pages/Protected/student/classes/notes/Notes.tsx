import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/interface/general";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const NotesTab = ({ courseId }: { courseId: number }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const mockNotes: Note[] = [
        {
            note_id: 1,
            title: "Introduction to TypeScript",
            content: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
            tags: ["typescript", "javascript", "programming"],
            is_private: false,
            created_at: new Date(),
            updated_at: new Date(),
            course_id: courseId
        },
        {
            note_id: 2,
            title: "React Basics",
            content: "React is a JavaScript library for building user interfaces.",
            tags: ["react", "javascript", "frontend"],
            is_private: false,
            created_at: new Date(),
            updated_at: new Date(),
            course_id: courseId
        },
        {
            note_id: 3,
            title: "Advanced CSS",
            content: "CSS is a language that describes the style of an HTML document.",
            tags: ["css", "web design", "frontend"],
            is_private: true,
            created_at: new Date(),
            updated_at: new Date(),
            course_id: courseId
        }
    ];

    useEffect(() => {
        setNotes(mockNotes);
    }, [courseId]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        tags: '',
        is_private: false
    });

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get(`/api/v1/notes/${courseId}`);
                setNotes(response.data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };

        fetchNotes();
    }, [courseId]);

    const handleCreateNote = async () => {
        try {
            const response = await axios.post('/api/v1/notes', {
                ...newNote,
                course_id: courseId,
                tags: newNote.tags.split(',').map(tag => tag.trim())
            });

            setNotes([...notes, response.data]);
            setIsCreateModalOpen(false);
            setNewNote({ title: '', content: '', tags: '', is_private: false });
        } catch (error) {
            console.error('Error creating note:', error);
        }
    };

    const handleUpdateNote = async () => {
        if (!selectedNote) return;

        try {
            await axios.put(`/api/v1/notes/${selectedNote.note_id}`, {
                title: selectedNote.title,
                content: selectedNote.content,
                tags: typeof selectedNote.tags === 'string' 
                    ? selectedNote.tags.split(',').map((tag: string) => tag.trim())
                    : selectedNote.tags,
                is_private: selectedNote.is_private
            });

            setNotes(notes.map(note => 
                note.note_id === selectedNote.note_id ? selectedNote : note
            ));
            setSelectedNote(null);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            await axios.delete(`/api/v1/notes/${noteId}`);
            setNotes(notes.filter(note => note.note_id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockNotes.map((note) => (
                        <Card key={note.note_id} className="relative">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{note.title}</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedNote(note)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteNote(note.note_id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">{note.content}</p>
                                <div className="flex gap-2 mt-2">
                                    {note.tags.map((tag: string, index: number) => (
                                        <span key={index} 
                                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>

            {/* Create Note Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({
                                ...newNote,
                                title: e.target.value
                            })}
                        />
                        <Textarea
                            placeholder="Content"
                            value={newNote.content}
                            onChange={(e) => setNewNote({
                                ...newNote,
                                content: e.target.value
                            })}
                        />
                        <Input
                            placeholder="Tags (comma-separated)"
                            value={newNote.tags}
                            onChange={(e) => setNewNote({
                                ...newNote,
                                tags: e.target.value
                            })}
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={newNote.is_private}
                                onChange={(e) => setNewNote({
                                    ...newNote,
                                    is_private: e.target.checked
                                })}
                            />
                            <label>Private Note</label>
                        </div>
                        <Button className="w-full" onClick={handleCreateNote}>
                            Create Note
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Note Modal */}
            <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                    </DialogHeader>
                    {selectedNote && (
                        <div className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={selectedNote.title}
                                onChange={(e) => setSelectedNote({
                                    ...selectedNote,
                                    title: e.target.value
                                })}
                            />
                            <Textarea
                                placeholder="Content"
                                value={selectedNote.content}
                                onChange={(e) => setSelectedNote({
                                    ...selectedNote,
                                    content: e.target.value
                                })}
                            />
                            <Input
                                placeholder="Tags (comma-separated)"
                                value={Array.isArray(selectedNote.tags) 
                                    ? selectedNote.tags.join(', ') 
                                    : selectedNote.tags}
                                onChange={(e) => setSelectedNote({
                                    ...selectedNote,
                                    tags: e.target.value
                                })}
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedNote.is_private}
                                    onChange={(e) => setSelectedNote({
                                        ...selectedNote,
                                        is_private: e.target.checked
                                    })}
                                />
                                <label>Private Note</label>
                            </div>
                            <Button className="w-full" onClick={handleUpdateNote}>
                                Update Note
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};
export default NotesTab;