// api/services.ts
import { domain } from '@/lib/constant';
import { useAuth } from '@/services/AuthContext';
import axios from 'axios';
import * as XLSX from 'xlsx';

// API Services
export const scheduleService = {
  // Initialize Schedule
  async initSchedule(params: {
    departmentId: number;
    batchYear: number;
    academicYear: number;
    semester: number;
    totalWeeks: number;
    userId: number | undefined;
    sectionId: number | undefined;  
  }) {
    const {user} = useAuth()
    params['userId'] = user?.user_id
    if (!params.userId) {
      throw new Error('User ID not found');
    }
    const response = await axios.post(`${domain}/api/v1/mannual-schedule/init`, params);
    return response.data;
  },

  // Get Time Slots
  async getTimeSlots(departmentId: number, semester: number) {
    const response = await axios.get(`${domain}/api/v1/mannual-schedule/grid`, {
      params: { departmentId, semester }
    });
    return response.data;
  },

  // Get Subjects
  async getSubjects(departmentId: number, semester: number) {
    const response = await axios.get(`${domain}/api/v1/mannual-schedule/subjects`, {
      params: { departmentId, semester }
    });
    return response.data;
  },

  // Get Available Faculty
  async getFaculty(subjectId: number, slotId: number) {
    const response = await axios.get(`${domain}/api/v1/mannual-schedule/faculty`, {
      params: { subjectId, slotId }
    });
    return response.data;
  },

  // Get Available Rooms
  async getRooms(slotId: number, buildingId?: number) {
    const response = await axios.get(`${domain}/api/v1/mannual-schedule/rooms`, {
      params: { slotId, buildingId }
    });
    return response.data;
  },

  // Assign Schedule
  async assignSchedule(params: {
    scheduleId: number;
    slotId: number;
    facultyId: number;
    roomId: number;
    subjectId: number;
    sectionId: number;
  }) {
    const response = await axios.post(`${domain}/api/v1/mannual-schedule/assign`, params);
    return response.data;
  },
};

// Excel Export Function
export const exportScheduleToExcel = (
  scheduleData: {
    day: string;
    time: string;
    subject: string;
    faculty: string;
    room: string;
    section: string;
  }[],
  filename: string
) => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(scheduleData);

  // Set column widths
  const colWidths = [
    { wch: 10 }, // Day
    { wch: 15 }, // Time
    { wch: 30 }, // Subject
    { wch: 25 }, // Faculty
    { wch: 15 }, // Room
    { wch: 15 }  // Section
  ];
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Usage in component
// const handleExportSchedule = async (scheduleId: number) => {
//   try {
//     // Fetch formatted schedule data
//     const response = await axios.get(`${domain}/api/v1/mannual-schedule/${scheduleId}/export`);
//     const scheduleData = response.data;

//     // Format data for Excel
//     const excelData = scheduleData.map(item => ({
//       Day: item.day,
//       Time: `${item.startTime}-${item.endTime}`,
//       Subject: item.subject,
//       Faculty: item.faculty,
//       Room: item.room,
//       Section: item.section
//     }));

//     // Export to Excel
//     exportScheduleToExcel(excelData, `schedule-${scheduleId}`);
//   } catch (error) {
//     console.error('Error exporting schedule:', error);
//     // Handle error (show notification, etc.)
//   }
// };
