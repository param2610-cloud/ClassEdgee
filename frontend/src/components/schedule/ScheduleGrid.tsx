import React, { useState } from 'react';
import { TimeSlot } from '@/interface/general';
import TimeTable from './TimeTableGrid';
import AssignmentPanel from './AssignmentPanel';
const ScheduleGrid: React.FC<{
    departmentId: number;
    semester: number;
  }> = ({ departmentId, semester }) => {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
    return (
      <div>
        <TimeTable slots={slots} onSlotClick={handleSlotClick} />
        {selectedSlot && (
          <AssignmentPanel 
            slotId={selectedSlot}
            departmentId={departmentId} 
            semester={semester}
          />
        )}
      </div>
    );
  }
  export default ScheduleGrid;