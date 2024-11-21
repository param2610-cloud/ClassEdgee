import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CreateTeacher from "./CreateTeacher";
import BulkTeacherUpload from "./BulkTeacherUpload";

const TeacherUploadLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState("manual");

    return (
        <div className="container mx-auto p-4">
            <Card className="p-6">
                <Tabs
                    defaultValue="manual"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Upload</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <CreateTeacher />
                    </TabsContent>

                    <TabsContent value="bulk">
                        <BulkTeacherUpload />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
};

export default TeacherUploadLayout;
