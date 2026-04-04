import React, { useCallback, useEffect, useState } from 'react';
import { scheduleService } from '@/api/service';
import TimeTable from './TimeTableGrid';
import AssignmentPanel from './AssignmentPanel';

const ScheduleGrid: React.FC<{
    departmentId: number;
    semester: number;
    scheduleId: number;
    sectionId: number;
    academicYear: number;
  }> = ({ departmentId, semester, scheduleId, sectionId, academicYear }) => {
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const loadSlots = useCallback(async () => {
      setLoading(true);
      try {
        const response = await scheduleService.getTimeSlots(departmentId, semester);
        const normalizedSlots = (response || []).map((slot: any) => ({
          id: slot.slot_id,
          dayOfWeek: Number(slot.day_of_week),
          startTime: slot.start_time,
          endTime: slot.end_time,
        }));
        setSlots(normalizedSlots);
      } catch (error) {
        console.error('Failed to load slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }, [departmentId, semester]);

    useEffect(() => {
      loadSlots();
    }, [loadSlots]);
  
    const handleSlotClick = (slotId: number): void => {
      // If the clicked slot is already selected, deselect it
      if (selectedSlot === slotId) {
        setSelectedSlot(null);
      } else {
        // Otherwise select the clicked slot
        setSelectedSlot(slotId);
      }
    };

    return (
      <div className="schedule-grid-container">
        {loading && <p className="p-4 text-sm text-muted-foreground">Loading timetable slots...</p>}
        <TimeTable 
          slots={slots}
          onSlotClick={handleSlotClick}
          
        />
        {selectedSlot && (
          <AssignmentPanel 
            slotId={selectedSlot}
            departmentId={departmentId} 
            semester={semester}
            scheduleId={scheduleId}
            sectionId={sectionId}
            academicYear={academicYear}
            onRefresh={() => {
              loadSlots();
            }}
          />
        )}
      </div>
    );
  }
  
  export default ScheduleGrid;