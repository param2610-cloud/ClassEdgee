import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = path.resolve('./uploads');
        
        try {
            // Create uploads directory if it doesn't exist
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            cb(err, null);
        }
    },
    filename: function (req, file, cb) {
        // Create a unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Optional: Add specific file type validation
        const allowedFileTypes = /pdf|doc|docx|txt/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

export default router;