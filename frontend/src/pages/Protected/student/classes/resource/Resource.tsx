import FacultyResourcesTab from "@/pages/Protected/faculty/classes/resource/Resource";

const StudentResourcesTab = ({ courseId }: { courseId: number }) => {
  return <FacultyResourcesTab courseId={courseId} readOnly />;
};

export default StudentResourcesTab;