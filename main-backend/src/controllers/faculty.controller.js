//import {facultyprofileSchema} from '../models/facultyprofile.schema.js'

import facultyprofileSchema from "../models/facultyprofile.schema.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generate.js";
import { fastapidomain } from "../lib/domain.js";
import mongoose from "mongoose";
import fs from "fs";
import axios from "axios"; 
import FormData from "form-data";

// Register a new faculty
const createfaculty = async (req, res) => {
    try {
        let { password, ...facultyData } = req.body;
        console.log(facultyData);
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
        };
        
        // Validate required fields
        const requiredFields = [
            // Personal Information
            'personalInformation.fullName',
            'personalInformation.dateOfBirth',
            'personalInformation.gender',
            'personalInformation.contactNumber',
            'personalInformation.email',
            
            // Qualification
            'qualification.highestDegree',
            'qualification.specialization',
            'qualification.universityInstitute',
            'qualification.yearOfPassing',
            
            // Professional Experience
            'professionalExperience.totalYearsOfExperience',
            'professionalExperience.previousJobTitle',
            'professionalExperience.previousOrganization',
            'professionalExperience.duration.startDate',
            'professionalExperience.duration.endDate',
            
            // Subject Expertise
            'subjectExpertise.primarySubject',
            
            // Additional Information
            'additionalInformation.address'
        ];
        

        for (const field of requiredFields) {
            if (!getNestedValue(facultyData, field)) {
                return res
                    .status(400)
                    .json({ message: `Missing required field: ${field}` });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(facultyData.personalInformation.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        password = "classedgee" // For testing purposes
        // Validate password strength
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    message: "Password must be at least 8 characters long",
                });
        }

        // Check if faculty ID or email already exists
        const existingfaculty = await facultyprofileSchema.findOne({
            $or: [
                { facultyId: facultyData.facultyId },
                { email: facultyData.email },
            ],
        });
        if (existingfaculty) {
            return res
                .status(409)
                .json({ message: "faculty ID or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newfaculty = new facultyprofileSchema({
            ...facultyData,
            password: hashedPassword,
        });

        await newfaculty.save();
        res.status(201).json({
            message: "faculty created successfully",
            facultyId: newfaculty.facultyId,
        });
    } catch (error) {
        console.error("Error in createfaculty:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            // Handle Mongoose validation errors
            const validationErrors = Object.values(error.errors).map(
                (err) => err.message
            );
            return res
                .status(400)
                .json({
                    message: "Validation error",
                    errors: validationErrors,
                });
        }

        if (error.code === 11000) {
            // Handle duplicate key errors
            return res
                .status(409)
                .json({
                    message:
                        "Duplicate key error. A faculty with this unique field already exists.",
                });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
const facultyblukupload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Log the FastAPI domain and file details for debugging
        console.log('FastAPI Domain:', fastapidomain);
        console.log('File details:', {
            path: req.file.path,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype
        });

        // Create form data
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Add timeout and better error handling
        const response = await axios.post(
            `${fastapidomain}/process-faculty-excel`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                },
                timeout: 30000, // 30 second timeout
                validateStatus: false // Don't throw error on non-2xx status
            }
        );

        // Clean up the temporary file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Handle non-200 responses from FastAPI
        if (response.status !== 200) {
            console.error('FastAPI Error:', response.data);
            return res.status(response.status).json({
                message: 'Error from processing server',
                error: response.data
            });
        }

        return res.status(200).json(response.data);

    } catch (error) {
        // Clean up on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Better error logging
        console.error('Error in bulk upload:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
        });

        // Handle different types of errors
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: 'Processing server is not available',
                error: 'Connection refused'
            });
        }

        if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                message: 'Processing server timed out',
                error: 'Request timeout'
            });
        }

        return res.status(500).json({
            message: 'Error processing file',
            error: error.message
        });
    }
};
// Log in a faculty
const loginfaculty = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // Find faculty by email
        const faculty = await facultyprofileSchema.findOne({ email });
        if (!faculty) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(
            faculty.email,
            "15m",
            "7d"
        );

        // Update the faculty's refresh token
        await facultyprofileSchema.findOneAndUpdate(
            { email: faculty.email },
            { refreshToken: refreshToken },
            { new: true }
        );

        // Set HTTP-only cookies
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Send response
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: faculty._id,
                firstName: faculty.firstName,
                lastName: faculty.lastName,
                email: faculty.email,
                facultyId: faculty.facultyId,
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};
const listoffaculty = async (req,res)=>{
    try {
        const facultys = await facultyprofileSchema.find();
        res.status(200).json(facultys);
    } catch (error) {
        console.error("Error retrieving facultys:", error);
        res.status(500).json({ error: "Failed to retrieve facultys" });
    }
}

const editfaculty = async (req, res) => {
    try {
        
        const facultyId = req.params.id;
        console.log(facultyId);
        console.log("adas");
        const updateData = req.body;
        console.log(updateData);
        
        // Remove fields that shouldn't be updated directly
        delete updateData.createdAt;
        delete updateData.facultyId; // Prevent facultyId modification
        
        // Add updatedAt timestamp
        updateData.updatedAt = new Date();
        if(updateData.gender=='F'){
            updateData.gender='Female';
        }else if(updateData.gender=='M'){
            updateData.gender='Male';
        }
        // Find and update the faculty
        const updatedfaculty = await facultyprofileSchema.findOneAndUpdate(
            { _id: facultyId },
            { $set: updateData },
            { 
                new: true, // Return the updated document
                runValidators: true // Run schema validators on update
            }
        );

        // Check if faculty exists
        if (!updatedfaculty) {
            return res.status(404).json({
                success: false,
                message: 'faculty not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'faculty updated successfully',
            data: updatedfaculty
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered',
                field: Object.keys(error.keyPattern)[0]
            });
        }

        // Handle other errors
        return res.status(500).json({
            success: false,
            message: 'Error updating faculty',
            error: error.message
        });
    }
}
const uniquefaculty = async(req,res)=>{
    try {
        console.log("adsfad");
        
        const facultyId = req.params.id;
        console.log(facultyId);
        
        const faculty = await facultyprofileSchema.findOne({ _id: facultyId });
        console.log(faculty);
        
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'faculty not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'faculty found successfully',
            data: faculty
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error finding faculty',
            error: error.message
        });
    }
}

const deletefaculty = async(req,res)=>{
    try {
        const facultyId = req.params.id;
        const deletedfaculty = await facultyprofileSchema.findByIdAndDelete(facultyId);
        if (!deletedfaculty) {
            return res.status(404).json({
                success: false,
                message: 'faculty not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'faculty deleted successfully',
            data: deletedfaculty
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting faculty',
            error: error.message
        });
    }
}

export { createfaculty, loginfaculty, facultyblukupload,listoffaculty,editfaculty,uniquefaculty,deletefaculty };
