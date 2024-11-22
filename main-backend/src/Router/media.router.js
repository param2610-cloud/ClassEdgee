import express from 'express'
import { upload } from '../utils/multer.js'
router.post("/upload", upload.single("media"),)