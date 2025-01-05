// Assignment Panel Component
import React, { useEffect, useState } from "react";
import { scheduleService } from "@/api/service";
import { fetchSubjects } from "@/api/scheduling-api/fetch";
import FacultySelector from "./FacultySelector";
import RoomSelector from "./RoomSelector";
import { SubjectDetail } from "@/interface/general";

interface AssignmentPanelProps {
  slotId: number;
  departmentId: number;
  semester: number;
  scheduleId: number;
  sectionId: number;
  onRefresh: () => void;
  onError?: (error: string) => void;
}

const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  slotId,
  departmentId,
  semester,
  scheduleId,
  sectionId,
  onRefresh,
  onError
}) => {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(slotId);

  const handleAssignment = async () => {
    if (!selectedSubject || !selectedFaculty || !selectedRoom) {
      onError?.("Please select all required fields");
      return;
    }

    try {
      await scheduleService.assignSchedule({
        scheduleId,
        slotId: selectedSlot,
        facultyId: selectedFaculty,
        roomId: selectedRoom,
        subjectId: selectedSubject,
        sectionId
      });

      // Reset selections
      setSelectedSubject(null);
      setSelectedFaculty(null);
      setSelectedRoom(null);
      setSelectedSlot(null);

      // Refresh grid data through parent component
      onRefresh();

    } catch (error) {
      console.error('Error assigning schedule:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to assign schedule');
    }
  };
    return (
      <div className="flex flex-col gap-4 p-4 border rounded">
        <SubjectSelector 
          departmentId={departmentId}
          semester={semester}
          onChange={setSelectedSubject}
        />
        
        {selectedSubject && (
          <FacultySelector
            subjectId={selectedSubject}
            slotId={slotId}
            onChange={setSelectedFaculty}  
          />
        )}
   
        {selectedFaculty && (
          <RoomSelector
            slotId={slotId}
            onChange={setSelectedRoom}
          />
        )}
   
        {selectedRoom && (
          <button
            onClick={handleAssignment}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Confirm Assignment
          </button>
        )}
      </div>
    );
   }
   
   // Selector Components
   const SubjectSelector: React.FC<{
    departmentId: number;
    semester: number;
    onChange: (id: number) => void;
   }> = ({ departmentId, semester, onChange }) => {
    const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
   
    useEffect(() => {
      fetchSubjects(departmentId, semester).then(setSubjects);
    }, [departmentId, semester]);
   
    return (
      <div>
        <label>Select Subject</label>
        <select onChange={e => onChange(Number(e.target.value))}>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name} ({subject.weeklyClasses} classes/week)
            </option>
          ))}
        </select>
      </div>
    );
   };
   export default AssignmentPanel;