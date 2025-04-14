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

  const handleAssignment = async () => {
    if (!selectedSubject || !selectedFaculty || !selectedRoom) {
      onError?.("Please select all required fields");
      return;
    }

    try {
      await scheduleService.assignSchedule({
        scheduleId,
        slotId, // Use slotId directly instead of selectedSlot
        facultyId: selectedFaculty,
        roomId: selectedRoom,
        subjectId: selectedSubject,
        sectionId
      });

      // Reset selections
      setSelectedSubject(null);
      setSelectedFaculty(null);
      setSelectedRoom(null);

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
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Select Subject</label>
        <select 
          onChange={e => onChange(Number(e.target.value))}
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a subject --</option>
          {subjects.map(subject => (
        <option key={subject.subject_id} value={subject.subject_id}>
          {subject.subject_name || "Unnamed Subject"} ({subject.weekly_classes || "N/A"} classes/week)
        </option>
          ))}
        </select>
      </div>
    );
   };
   export default AssignmentPanel;