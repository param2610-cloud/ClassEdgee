
import ScheduleGenerator from './SechduleGenerator'; 
import ScheduleViewer from './ScheduleViewer'; // Fixed import name
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchedulePlanner from './MannualScheduler';
import { Calendar, PlusCircle, Eye } from 'lucide-react'; // Added icons

export default function ScheduleDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Class Schedule Management</h1>
        <p className="text-muted-foreground">View, generate, or manually create class schedules</p>
      </div>
      
      <Tabs defaultValue="viewer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="viewer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>View Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Generate Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2"> {/* Fixed spelling */}
            <Calendar className="h-4 w-4" />
            <span>Manual Scheduler</span> {/* Fixed spelling */}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="viewer" className="mt-6">
          <ScheduleViewer />
        </TabsContent>
        
        <TabsContent value="generator" className="mt-6">
          <ScheduleGenerator />
        </TabsContent>
        
        <TabsContent value="manual" className="mt-6"> {/* Fixed value */}
          <SchedulePlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}