//import {studentModel} from '../models/studentprofile.schema.js'

import { studentModel } from "../models/studentprofile.schema.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generate.js";
import { fastapidomain } from "../lib/domain.js";
import mongoose from "mongoose";
import fs from "fs";
import axios from "axios"; 
import FormData from "form-data";

// Register a new student
const createStudent = async (req, res) => {
    try {
        let { password, ...studentData } = req.body;
        console.log(studentData);
        
        // Validate required fields
        const requiredFields = [
            "firstName",
            "lastName",
            "dateOfBirth",
            "gender",
            "email",
            "phoneNumber",
            "address",
            "studentId",
            "enrollmentDate",
            "grade",
            "guardianName",
            "guardianRelation",
            "guardianContact",
            "emergencyContact",
            "profile_image_link"
        ];

        for (const field of requiredFields) {
            if (!studentData[field]) {
                return res
                    .status(400)
                    .json({ message: `Missing required field: ${field}` });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Validate password strength
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    message: "Password must be at least 8 characters long",
                });
        }

        // Check if student ID or email already exists
        const existingStudent = await studentModel.findOne({
            $or: [
                { studentId: studentData.studentId },
                { email: studentData.email },
            ],
        });
        if (existingStudent) {
            return res
                .status(409)
                .json({ message: "Student ID or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new studentModel({
            ...studentData,
            password: hashedPassword,
        });

        await newStudent.save();
        res.status(201).json({
            message: "Student created successfully",
            studentId: newStudent.studentId,
        });
    } catch (error) {
        console.error("Error in createStudent:", error);

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
                        "Duplicate key error. A student with this unique field already exists.",
                });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
const studentblukupload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Send file to FastAPI server
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const response = await axios.post(
            `${fastapidomain}/process-excel`,  // FastAPI endpoint
            form,
            {
                headers: {
                    ...form.getHeaders(),
                }
            }
        );
        console.log(response.data);
        
        // Clean up - delete the temporary file
        fs.unlinkSync(req.file.path);

        // Return the response from FastAPI
        return res.status(200).json(response.data);

    } catch (error) {
        // Clean up on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        console.error('Error in bulk upload:', error);
        return res.status(500).json({
            message: 'Error processing file',
            error: error.message
        });
    }
};
// Log in a student
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // Find student by email
        const student = await studentModel.findOne({ email });
        if (!student) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(
            student.email,
            "15m",
            "7d"
        );

        // Update the student's refresh token
        await studentModel.findOneAndUpdate(
            { email: student.email },
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
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                studentId: student.studentId,
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};
const listofstudent = async (req,res)=>{
    try {
        const students = await studentModel.find();
        res.status(200).json(students);
    } catch (error) {
        console.error("Error retrieving students:", error);
        res.status(500).json({ error: "Failed to retrieve students" });
    }
}

const editStudent = async (req, res) => {
    try {
        
        const studentId = req.params.id;
        console.log(studentId);
        console.log("adas");
        const updateData = req.body;
        console.log(updateData);
        
        // Remove fields that shouldn't be updated directly
        delete updateData.createdAt;
        delete updateData.studentId; // Prevent studentId modification
        
        // Add updatedAt timestamp
        updateData.updatedAt = new Date();
        if(updateData.gender=='F'){
            updateData.gender='Female';
        }else if(updateData.gender=='M'){
            updateData.gender='Male';
        }
        // Find and update the student
        const updatedStudent = await studentModel.findOneAndUpdate(
            { _id: studentId },
            { $set: updateData },
            { 
                new: true, // Return the updated document
                runValidators: true // Run schema validators on update
            }
        );

        // Check if student exists
        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
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
            message: 'Error updating student',
            error: error.message
        });
    }
}
const uniquestudent = async(req,res)=>{
    try {
        console.log("adsfad");
        
        const studentId = req.params.id;
        console.log(studentId);
        
        const student = await studentModel.findOne({ _id: studentId });
        console.log(student);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Student found successfully',
            data: student
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error finding student',
            error: error.message
        });
    }
}

const deletestudent = async(req,res)=>{
    try {
        const studentId = req.params.id;
        const deletedStudent = await studentModel.findByIdAndDelete(studentId);
        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            data: deletedStudent
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
}

export { createStudent, loginStudent, studentblukupload,listofstudent,editStudent,uniquestudent,deletestudent };
