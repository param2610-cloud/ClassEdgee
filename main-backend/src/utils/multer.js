import express from 'express';
const router = express.Router();
import multer from 'multer';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Allow all file types
        cb(null, true);
    }
});
