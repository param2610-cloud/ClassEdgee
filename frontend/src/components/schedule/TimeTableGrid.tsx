// Types for the grid
import React, { useMemo } from 'react';
interface GridCell {
    slotId: number;
    subject?: string;
    faculty?: string;
    room?: string;
  }
  
  interface TimeTableProps {
    slots: TimeSlot[];
    assignments?: {
      [key: string]: {
        subject: string;
        faculty: string;
        room: string;
      }
    };
    onSlotClick: (slotId: number) => void;
  }
  
  const TimeTable: React.FC<TimeTableProps> = ({ slots, assignments, onSlotClick }) => {
    // Group slots by day and sort by time
    const groupedSlots = useMemo(() => {
      const days: { [key: number]: TimeSlot[] } = {};
      slots.forEach(slot => {
        if (!days[slot.dayOfWeek]) {
          days[slot.dayOfWeek] = [];
        }
        days[slot.dayOfWeek].push(slot);
      });
  
      // Sort slots within each day
      Object.values(days).forEach(daySlots => {
        daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      });
  
      return days;
    }, [slots]);
  
    // Get all unique times for headers
    const timeHeaders = useMemo(() => {
      const times = new Set<string>();
      slots.forEach(slot => {
        times.add(`${slot.startTime}-${slot.endTime}`);
      });
      return Array.from(times).sort();
    }, [slots]);
  
    const getDayName = (day: number) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      return days[day - 1];
    };
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr>
              <th className="border p-2">Time / Day</th>
              {[1, 2, 3, 4, 5].map(day => (
                <th key={day} className="border p-2">
                  {getDayName(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeHeaders.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="border p-2 font-medium">{timeSlot}</td>
                {[1, 2, 3, 4, 5].map(day => {
                  const slot = groupedSlots[day]?.find(
                    s => `${s.startTime}-${s.endTime}` === timeSlot
                  );
                  const assignment = slot && assignments?.[slot.id];
  
                  return (
                    <td 
                      key={`${day}-${timeSlot}`}
                      className={`border p-2 ${slot ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => slot && onSlotClick(slot.id)}
                    >
                      {assignment ? (
                        <div className="space-y-1">
                          <div className="font-medium">{assignment.subject}</div>
                          <div className="text-sm">{assignment.faculty}</div>
                          <div className="text-sm text-gray-600">{assignment.room}</div>
                        </div>
                      ) : slot ? (
                        <div className="text-gray-400 text-center">Available</div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  export default TimeTable;