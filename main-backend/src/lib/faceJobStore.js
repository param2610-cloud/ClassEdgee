const faceJobs = new Map();

const nowIso = () => new Date().toISOString();

export const createFaceJob = ({ jobId, jobType, payloadMeta = {} }) => {
  const createdAt = nowIso();
  const job = {
    job_id: jobId,
    job_type: jobType,
    status: "queued",
    created_at: createdAt,
    updated_at: createdAt,
    payload_meta: payloadMeta,
    result: null,
    error: null,
  };

  faceJobs.set(jobId, job);
  return job;
};

export const updateFaceJob = (jobId, patch) => {
  const existing = faceJobs.get(jobId);
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...patch,
    updated_at: nowIso(),
  };

  faceJobs.set(jobId, updated);
  return updated;
};

export const getFaceJob = (jobId) => faceJobs.get(jobId) || null;
