import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const createSubject = async (req, res) => {
    try {
        const { syllabusId } = req.params;
        const {
            course_id,
            subject_name,
            subject_code,
            subject_type,
            preferred_faculty_specializations,
            resources_required,
        } = req.body;

        // Basic validation
        if (!syllabusId || !course_id || !subject_type) {
            return res.status(400).json({
                error: "Missing required fields: syllabusId, course_id, and subject_type are required",
            });
        }

        // Check if subject_type is valid enum value
        if (!["theory", "lab", "project"].includes(subject_type)) {
            return res.status(400).json({
                error: "Invalid subject_type. Must be one of: theory, lab, project",
            });
        }

        const subject = await prisma.subject_details.create({
            data: {
                syllabus_id: parseInt(syllabusId),
                course_id: parseInt(course_id),
                subject_type,
                subject_name,
                subject_code,
                preferred_faculty_specializations:
                    preferred_faculty_specializations || [],
                resources_required: resources_required || [],
            },
        });

        res.status(201).json(subject);
    } catch (error) {
        console.error("Error creating subject:", error);
        res.status(500).json({ error: "Failed to create subject" });
    }
};
const getSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const subject = await prisma.subject_details.findUnique({
            where: { id: parseInt(subjectId) },
            include:{
                faculty_subject_mapping:{
                    include:{
                        faculty:{
                            include:{
                                users:true
                            }
                        }
                    }
                }
            }
        });
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        res.status(200).json(subject);
    } catch (error) {
        console.error("Error getting subject:", error);
        res.status(500).json({ error: "Failed to get subject" });
    }
}
const getSubjectName = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const subject = await prisma.subject_details.findUnique({
            where: { id: parseInt(subjectId) },
            select: {
                subject_name: true,
            },
        });
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        res.status(200).json(subject);
    } catch (error) {
        console.error("Error getting subject:", error);
        res.status(500).json({ error: "Failed to get subject" });
    }
}
const list_of_subject_for_semester = async (req,res)=>{
    const {course_id,semester}=req.params;
    const subjects = await prisma.syllabus_structure.findFirst({
        where:{
            course_id:parseInt(course_id),
            semester:parseInt(semester)
        },
        include:{
            subject_details:{
                include:{
                    faculty_subject_mapping:{
                        include:{
                            faculty:{
                                include:{
                                    users:true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    res.json({
        subjects,
        error: false,
        message: "success",
        data: {
            subjects
        }
    })
}
export {createSubject,getSubject,list_of_subject_for_semester,getSubjectName}