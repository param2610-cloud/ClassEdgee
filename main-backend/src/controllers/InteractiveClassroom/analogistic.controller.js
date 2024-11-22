import { PrismaClient } from '@prisma/client';


// Get Student Engagement Records
const studentEngagement = async (req, res) => {
  try {
    const engagementRecords = await PrismaClient.studentengagement.findMany({
      include: { 
        students: true, 
        classes: true 
      }
    });
    res.json(engagementRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Student Engagement Record

const addStudentEngagement = async (req, res) => {
  const { 
    class_id, 
    student_id, 
    engagement_type, 
    engagement_metrics, 
    duration, 
    notes 
  } = req.body;

  try {
    const newEngagementRecord = await PrismaClient.studentengagement.create({
      data: {
        class_id,
        student_id,
        engagement_type,
        engagement_metrics,
        duration,
        notes
      }
    });
    res.json(newEngagementRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Student Engagement Record

const updateStudentEngagement = async (req, res) => {
  const { id } = req.params;
  const { 
    engagement_type, 
    engagement_metrics, 
    duration, 
    notes 
  } = req.body;

  try {
    const updatedEngagementRecord = await PrismaClient.studentengagement.update({
      where: { engagement_id: parseInt(id) },
      data: {
        engagement_type,
        engagement_metrics,
        duration,
        notes
      }
    });
    res.json(updatedEngagementRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Student Engagement Record
// router.delete('/student-engagement/:id',
const deleteStudentEngagement = async (req, res) => {
  const { id } = req.params;
  
  try {
    await PrismaClient.studentengagement.delete({
      where: { engagement_id: parseInt(id) }
    });
    res.json({ message: 'Student engagement record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {studentEngagement, addStudentEngagement, updateStudentEngagement, deleteStudentEngagement}