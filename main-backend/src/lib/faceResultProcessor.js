import { PrismaClient } from "@prisma/client";
import { updateFaceJob } from "./faceJobStore.js";

const prisma = new PrismaClient();

const toDateOnly = (incoming) => {
  const source = incoming ? new Date(incoming) : new Date();
  const isoDate = source.toISOString().split("T")[0];
  return new Date(isoDate);
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const decideAttendance = (match) => {
  const minFrames = toNumber(process.env.FACE_PRESENT_MIN_FRAMES, 2);
  const highConfidenceThreshold = Number(process.env.FACE_SINGLE_FRAME_HIGH_CONF || 0.8);
  const seenFrames = Array.isArray(match.seen_in_frames)
    ? match.seen_in_frames.length
    : toNumber(match.seen_count, 0);
  const confidence = Number(match.best_confidence ?? match.confidence ?? 0);

  if (seenFrames >= minFrames) {
    return {
      status: "present",
      needsReview: false,
      confidence,
      seenFrames,
    };
  }

  if (seenFrames === 1 && confidence >= highConfidenceThreshold) {
    return {
      status: "present",
      needsReview: false,
      confidence,
      seenFrames,
    };
  }

  return {
    status: "absent",
    needsReview: seenFrames > 0,
    confidence,
    seenFrames,
  };
};

const handleRegisterResult = async (payload) => {
  if (payload.status !== "success") {
    return;
  }

  const sectionId = toNumber(payload.section_id, NaN);
  const modelUrl = payload.model_url;

  if (!Number.isFinite(sectionId) || !modelUrl) {
    return;
  }

  await prisma.sections.update({
    where: { section_id: sectionId },
    data: {
      face_recognition_model: modelUrl,
    },
  });
};

const handleRecognizeResult = async (payload) => {
  if (payload.status !== "success") {
    return;
  }

  const classId = toNumber(payload.class_id, NaN);
  const matches = Array.isArray(payload.matches) ? payload.matches : [];

  if (!Number.isFinite(classId) || matches.length === 0) {
    return;
  }

  const attendanceDate = toDateOnly(payload.attendance_date);

  for (const match of matches) {
    const enrollment = match.enrollment;
    if (!enrollment) {
      continue;
    }

    const student = await prisma.students.findUnique({
      where: { enrollment_number: enrollment },
      select: { student_id: true },
    });

    if (!student) {
      continue;
    }

    const decision = decideAttendance(match);
    const deviceInfo = {
      source: "ml-worker",
      confidence: decision.confidence,
      seen_in_frames: decision.seenFrames,
      needs_review: decision.needsReview,
      raw_match: {
        enrollment: match.enrollment,
        best_confidence: match.best_confidence ?? match.confidence,
        seen_in_frames: match.seen_in_frames,
      },
    };

    await prisma.attendance.upsert({
      where: {
        class_id_student_id_date: {
          class_id: classId,
          student_id: student.student_id,
          date: attendanceDate,
        },
      },
      update: {
        status: decision.status,
        verification_method: "facial",
        device_info: deviceInfo,
      },
      create: {
        class_id: classId,
        student_id: student.student_id,
        date: attendanceDate,
        status: decision.status,
        verification_method: "facial",
        device_info: deviceInfo,
      },
    });
  }
};

export const processFaceResultMessage = async (payload) => {
  const jobId = payload.job_id || payload.jobId;
  const jobType = payload.job_type || payload.jobType;

  if (jobType === "register") {
    await handleRegisterResult(payload);
  }

  if (jobType === "recognize") {
    await handleRecognizeResult(payload);
  }

  if (jobId) {
    updateFaceJob(jobId, {
      status: payload.status === "success" ? "completed" : "failed",
      result: payload.status === "success" ? payload : null,
      error: payload.status === "success" ? null : payload.error || "Worker job failed",
    });
  }
};
