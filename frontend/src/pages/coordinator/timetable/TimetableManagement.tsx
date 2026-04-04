import { Calendar, Eye, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/PageHeader";
import ScheduleGenerator from "@/pages/Protected/faculty/schedule/ScheduleGenerator";
import WeeklySchedule from "@/pages/Protected/faculty/schedule/ScheduleViewerComponent";
import SchedulePlanner from "@/pages/Protected/faculty/schedule/ManualScheduler";

const TimetableManagement = () => {
  return (
    <div>
      <PageHeader
        title="Timetable Management"
        description="Generate, view, and adjust academic schedules."
        breadcrumbs={[{ label: "Dashboard", href: "/coordinator" }, { label: "Timetable" }]}
      />

      <Tabs defaultValue="viewer" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="viewer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>View Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Generate Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Manual Scheduler</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewer">
          <WeeklySchedule />
        </TabsContent>

        <TabsContent value="generator">
          <ScheduleGenerator />
        </TabsContent>

        <TabsContent value="manual">
          <SchedulePlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimetableManagement;
