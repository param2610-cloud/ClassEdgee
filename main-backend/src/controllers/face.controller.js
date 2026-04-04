import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  FACE_REGISTER_QUEUE,
  FACE_RECOGNIZE_QUEUE,
  publishFaceJob,
} from "../lib/faceQueue.js";
import { createFaceJob, getFaceJob } from "../lib/faceJobStore.js";

const prisma = new PrismaClient();

const normalizeImageUrls = (body) => {
  if (Array.isArray(body.imageUrls)) {
    return body.imageUrls;
  }
  if (Array.isArray(body.image_urls)) {
    return body.image_urls;
  }
  return [];
};

const normalizeCaptureUrls = (body) => {
  const candidates =
    body.capture_urls ||
    body.captureUrls ||
    body.video_urls ||
    body.videoUrls ||
    [];

  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates.filter((value) => typeof value === "string" && value.trim().length > 0);
};

const findStudentContext = async (body) => {
  if (body.student_id) {
    return prisma.students.findUnique({
      where: { student_id: Number(body.student_id) },
      select: {
        student_id: true,
        user_id: true,
        section_id: true,
        enrollment_number: true,
      },
    });
  }

  if (body.user_id) {
    return prisma.students.findFirst({
      where: { user_id: Number(body.user_id) },
      select: {
        student_id: true,
        user_id: true,
        section_id: true,
        enrollment_number: true,
      },
    });
  }

  if (body.enrollment) {
    return prisma.students.findUnique({
      where: { enrollment_number: String(body.enrollment) },
      select: {
        student_id: true,
        user_id: true,
        section_id: true,
        enrollment_number: true,
      },
    });
  }

  return null;
};

export const queueFaceRegistration = async (req, res) => {
  try {
    const imageUrls = normalizeImageUrls(req.body);
    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "imageUrls is required and must be a non-empty array",
      });
    }

    const student = await findStudentContext(req.body);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student context not found",
      });
    }

    if (!student.section_id) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to any section",
      });
    }

    const section = await prisma.sections.findUnique({
      where: { section_id: student.section_id },
      select: {
        face_recognition_model: true,
      },
    });

    const jobId = uuidv4();
    const payload = {
      job_id: jobId,
      job_type: "register",
      section_id: student.section_id,
      student_id: student.student_id,
      user_id: student.user_id,
      enrollment: student.enrollment_number,
      image_urls: imageUrls,
      current_model_url: section?.face_recognition_model || null,
    };

    createFaceJob({
      jobId,
      jobType: "register",
      payloadMeta: {
        section_id: student.section_id,
        student_id: student.student_id,
      },
    });

    await publishFaceJob(FACE_REGISTER_QUEUE, payload);

    return res.status(202).json({
      success: true,
      message: "Face registration job queued",
      job_id: jobId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to queue face registration",
      error: error.message,
    });
  }
};

export const queueFaceClassProcessing = async (req, res) => {
  try {
    const classId = Number(req.body.class_id ?? req.body.classId);
    const captureUrls = normalizeCaptureUrls(req.body);

    if (!Number.isFinite(classId)) {
      return res.status(400).json({
        success: false,
        message: "class_id is required",
      });
    }

    if (captureUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "capture_urls is required and must be a non-empty array",
      });
    }

    const cls = await prisma.classes.findUnique({
      where: { class_id: classId },
      select: {
        class_id: true,
        section_id: true,
      },
    });

    if (!cls || !cls.section_id) {
      return res.status(404).json({
        success: false,
        message: "Class or section not found",
      });
    }

    const section = await prisma.sections.findUnique({
      where: { section_id: cls.section_id },
      select: {
        face_recognition_model: true,
      },
    });

    if (!section?.face_recognition_model) {
      return res.status(400).json({
        success: false,
        message: "Face model not available for section",
      });
    }

    const jobId = uuidv4();
    const payload = {
      job_id: jobId,
      job_type: "recognize",
      class_id: classId,
      section_id: cls.section_id,
      model_url: section.face_recognition_model,
      capture_urls: captureUrls,
      confidence_threshold: Number(req.body.confidence_threshold ?? 0.6),
      attendance_date: req.body.attendance_date || null,
    };

    createFaceJob({
      jobId,
      jobType: "recognize",
      payloadMeta: {
        class_id: classId,
        section_id: cls.section_id,
      },
    });

    await publishFaceJob(FACE_RECOGNIZE_QUEUE, payload);

    return res.status(202).json({
      success: true,
      message: "Face attendance processing job queued",
      job_id: jobId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to queue face attendance processing",
      error: error.message,
    });
  }
};

export const getFaceJobStatus = async (req, res) => {
  const jobId = req.params.jobId;
  const job = getFaceJob(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: job,
  });
};
