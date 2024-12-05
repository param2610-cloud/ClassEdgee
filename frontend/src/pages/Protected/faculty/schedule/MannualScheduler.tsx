import { scheduleService } from "@/api/service";
import InitialForm from "@/components/schedule/InitialForm";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/services/AuthContext";
import { useState } from "react";
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


// In the main SchedulePlanner component
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
    const {toast} = useToast();
    const {user} = useAuth();
  
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
        // Initialize schedule through API
        const response = await scheduleService.initSchedule(data);
        
        // Update schedule params with the newly created schedule ID
        setScheduleParams({
          ...data,
          scheduleId: response.schedule_id,
          sectionId: response.section_id
        });
  
      } catch (error) {
        console.error('Error initializing schedule:', error);
        toast({
            title: 'Error',
            description: 'Failed to initialize schedule',
            variant: 'destructive'
            });
      }
    };
  
    return (
      <div className="container mx-auto p-4">
        {!scheduleParams.scheduleId && user?.user_id ? (
          <InitialForm onSubmit={handleInitSubmit} userId={user?.user_id} />
        ) : (
            <>
          {scheduleParams.departmentId && scheduleParams.semester && scheduleParams.scheduleId && scheduleParams.academicYear && <ScheduleGrid 
            departmentId={scheduleParams.departmentId}
            semester={scheduleParams.semester}
            scheduleId={scheduleParams.scheduleId}
            academicYear={scheduleParams.academicYear}
            sectionId={scheduleParams.sectionId}
            />}
            </>
        )}
      </div>
    );
  };
  
  export default SchedulePlanner;