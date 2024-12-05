import React from 'react';
import ScheduleGenerator from './SechduleGenerator'; 
import ScheduleViewer from './SechduleViewerComponent'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchedulePlanner from './MannualScheduler';

export default function ScheduleDashboard() {
  console.log("ScheduleDashboard");
  
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="viewer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="viewer">View Schedule</TabsTrigger>
          <TabsTrigger value="generator">Generate Schedule</TabsTrigger>
          <TabsTrigger value="mannual">Mannual Scheduler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="viewer">
          <ScheduleViewer />
        </TabsContent>
        
        <TabsContent value="generator">
          <ScheduleGenerator />
        </TabsContent>
        <TabsContent value="mannual">
          <SchedulePlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}