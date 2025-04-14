import { scheduleService } from "@/api/service";
import InitialForm from "@/components/schedule/InitialForm";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/services/AuthContext";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilRuler, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleParams {
  departmentId: number | null;
  batchYear: number | null;
  academicYear: number | null;
  semester: number | null;
  totalWeeks: number | null;
  scheduleId: number | null;
  sectionId: number | null;
  userId: number | null;
}

const SchedulePlanner: React.FC = () => {
  const [scheduleParams, setScheduleParams] = useState<ScheduleParams>({
    departmentId: null,
    batchYear: null,
    academicYear: null,
    semester: null,
    totalWeeks: null,
    scheduleId: null,
    sectionId: null,
    userId: null,
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setIsLoading] = useState(false);

  const handleInitSubmit = async (data: {
    departmentId: number;
    batchYear: number;
    academicYear: number;
    semester: number;
    totalWeeks: number;
    userId: number;
    sectionId: number | undefined;
  }) => {
    try {
      setIsLoading(true);
      // Initialize schedule through API
      const response = await scheduleService.initSchedule(data);
      
      // Update schedule params with the newly created schedule ID
      setScheduleParams({
        ...data,
        scheduleId: response.schedule_id,
        sectionId: response.section_id
      });
      
      toast({
        title: 'Success',
        description: 'Schedule initialized successfully',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error initializing schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize schedule',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSchedule = () => {
    setScheduleParams({
      departmentId: null,
      batchYear: null,
      academicYear: null,
      semester: null,
      totalWeeks: null,
      scheduleId: null,
      sectionId: null,
      userId: null,
    });
  };

  return (
    <div className="container mx-auto">
      {!scheduleParams.scheduleId && user?.user_id ? (
        <Card className="max-w-3xl mx-auto border shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <PencilRuler className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Manual Schedule Creator</CardTitle>
            </div>
            <CardDescription>
              Create and customize your class schedule manually by setting up the basic parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InitialForm onSubmit={handleInitSubmit} userId={user?.user_id}  />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={resetSchedule}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Setup
            </Button>
            
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-sm text-primary">
              <AlertCircle className="h-4 w-4" />
              <span>Schedule ID: {scheduleParams.scheduleId}</span>
            </div>
          </div>
          
          {scheduleParams.departmentId && 
           scheduleParams.semester && 
           scheduleParams.scheduleId && 
           scheduleParams.academicYear && (
            <Card className="border shadow-md">
              <CardContent className="p-0">
                <ScheduleGrid 
                  departmentId={scheduleParams.departmentId}
                  semester={scheduleParams.semester}
                  // scheduleId={scheduleParams.scheduleId}
                  // academicYear={scheduleParams.academicYear}
                  // sectionId={scheduleParams.sectionId}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulePlanner;