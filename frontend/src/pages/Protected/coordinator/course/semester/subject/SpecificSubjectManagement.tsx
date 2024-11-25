import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useParams } from "react-router-dom";
import { domain } from "@/lib/constant";

// Types based on the Prisma schema
interface Topic {
    topic_id: number;
    unit_id: number;
    topic_name: string;
    topic_description: string | null;
    created_at?: Date;
    updated_at?: Date;
}

interface Unit {
    unit_id: number;
    subject_id: number;
    unit_number: number;
    unit_name: string;
    required_hours: number;
    learning_objectives: string[];
    created_at?: Date;
    updated_at?: Date;
    topics: Topic[];
}

const UnitTopicManagement = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [currentUnit, setCurrentUnit] = useState({
        unit_number: 0,
        unit_name: "",
        required_hours: 0,
        learning_objectives: [] as string[],  // Explicitly type as string[]
    });
    

    const [showUnitForm, setShowUnitForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { subject_id } = useParams();

    // Fetch units on component mount
    useEffect(() => {
        fetchUnits();
    }, [subject_id]);

    const fetchUnits = async () => {
        try {
            const response = await fetch(`${domain}/api/v1/curriculum/unit/${subject_id}`);
            if (!response.ok) throw new Error("Failed to fetch units");
            const data = await response.json();
            setUnits(data);
        } catch (err) {
            setError("Failed to fetch units. Please try again.");
        }
    };

    const handleUnitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
    
        try {
            const response = await fetch(`${domain}/api/v1/curriculum/unit/${subject_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...currentUnit,
                    learning_objectives: currentUnit.learning_objectives,  // Already an array
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create unit");
            }
    
            const newUnit = await response.json();
            setUnits([...units, { ...newUnit, topics: [] }]);
            setCurrentUnit({
                unit_number: 0,
                unit_name: "",
                required_hours: 0,
                learning_objectives: [],  // Reset to empty array
            });
            setShowUnitForm(false);
            setSuccess("Unit created successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to create unit. Please try again.");
        }
    };

    const handleAddTopic = async (unitId: number, topicData: Partial<Topic>) => {
        try {
            const response = await fetch(`${domain}/api/v1/curriculum/topic/${unitId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(topicData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create topic");
            }

            const newTopic = await response.json();
            setUnits(
                units.map((unit) => {
                    if (unit.unit_id === unitId) {
                        return {
                            ...unit,
                            topics: [...unit.topics, newTopic],
                        };
                    }
                    return unit;
                })
            );
            setSuccess("Topic added successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to add topic. Please try again.");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Unit Management
                        <Button
                            onClick={() => setShowUnitForm(!showUnitForm)}
                            className="flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add New Unit
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="mb-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {showUnitForm && (
                        <form onSubmit={handleUnitSubmit} className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    placeholder="Unit Number"
                                    value={currentUnit.unit_number}
                                    onChange={(e) =>
                                        setCurrentUnit({
                                            ...currentUnit,
                                            unit_number: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    placeholder="Unit Name"
                                    value={currentUnit.unit_name}
                                    onChange={(e) =>
                                        setCurrentUnit({
                                            ...currentUnit,
                                            unit_name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <Input
                                type="number"
                                placeholder="Required Hours"
                                value={currentUnit.required_hours}
                                onChange={(e) =>
                                    setCurrentUnit({
                                        ...currentUnit,
                                        required_hours: parseInt(e.target.value) || 0,
                                    })
                                }
                                required
                            />
                            <Textarea
    placeholder="Learning Objectives (one per line)"
    value={Array.isArray(currentUnit.learning_objectives) 
        ? currentUnit.learning_objectives.join('\n')
        : ''}
    onChange={(e) =>
        setCurrentUnit({
            ...currentUnit,
            learning_objectives: e.target.value.split('\n').filter(Boolean),
        })
    }
    required
/>
                            <div className="flex gap-2">
                                <Button type="submit">Create Unit</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowUnitForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    <Accordion type="single" collapsible className="w-full">
                        {units.map((unit) => (
                            <AccordionItem
                                key={unit.unit_id}
                                value={`unit-${unit.unit_id}`}
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">
                                            Unit {unit.unit_number}: {unit.unit_name}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <TopicForm
                                        unitId={unit.unit_id}
                                        onSubmit={handleAddTopic}
                                    />
                                    <div className="mt-4 space-y-2">
                                        {unit.topics.map((topic) => (
                                            <div
                                                key={topic.topic_id}
                                                className="p-3 bg-gray-50 rounded-lg"
                                            >
                                                <h4 className="font-medium">
                                                    {topic.topic_name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {topic.topic_description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};

const TopicForm = ({
    unitId,
    onSubmit,
}: {
    unitId: number;
    onSubmit: (unitId: number, topic: Partial<Topic>) => Promise<void>;
}) => {
    const [topic, setTopic] = useState({
        topic_name: "",
        topic_description: "",
    });
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(unitId, topic);
        setTopic({ topic_name: "", topic_description: "" });
        setShowForm(false);
    };

    return (
        <div className="mt-4">
            {!showForm ? (
                <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add Topic
                </Button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Topic Name"
                        value={topic.topic_name}
                        onChange={(e) =>
                            setTopic({
                                ...topic,
                                topic_name: e.target.value,
                            })
                        }
                        required
                    />
                    <Textarea
                        placeholder="Topic Description"
                        value={topic.topic_description}
                        onChange={(e) =>
                            setTopic({
                                ...topic,
                                topic_description: e.target.value,
                            })
                        }
                        required
                    />
                    <div className="flex gap-2">
                        <Button type="submit">Add Topic</Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UnitTopicManagement;