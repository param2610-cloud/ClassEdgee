import FacultyNotesTab from "@/pages/Protected/faculty/classes/notes/Notes";

const StudentNotesTab = ({ courseId }: { courseId: number }) => {
  return <FacultyNotesTab courseId={courseId} readOnly />;
};

export default StudentNotesTab;