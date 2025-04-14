import React, { useState } from 'react';
import { TimeSlot } from '@/interface/general';
import TimeTable from './TimeTableGrid';
import AssignmentPanel from './AssignmentPanel';

const ScheduleGrid: React.FC<{
    departmentId: number;
    semester: number;
  }> = ({ departmentId, semester }) => {
    const [slots, ] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [scheduleId, ] = useState<number>(0);
    const [sectionId, ] = useState<number>(0);
  
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
            onRefresh={() => {
              // Implement refresh logic here
              console.log("Refreshing data");
            }}
          />
        )}
      </div>
    );
  }
  
  export default ScheduleGrid;