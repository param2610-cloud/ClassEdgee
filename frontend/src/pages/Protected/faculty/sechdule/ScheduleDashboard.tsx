import React from 'react';
import ScheduleGenerator from './SechduleGenerator'; 
import ScheduleViewer from './SechduleViewerComponent'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScheduleDashboard() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="viewer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="viewer">View Schedule</TabsTrigger>
          <TabsTrigger value="generator">Generate Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="viewer">
          <ScheduleViewer />
        </TabsContent>
        
        <TabsContent value="generator">
          <ScheduleGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}