//import {studentModel} from '../models/studentprofile.schema.js'

import{studentModel} from "../models/studentprofile.schema.js"
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generate.js";

// Register a new student
const createStudent = async (req, res) => {
    try {
        const { password, ...studentData } = req.body;

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
            "emergencyContact"
        ];

        for (const field of requiredFields) {
            if (!studentData[field]) {
                return res.status(400).json({ message: `Missing required field: ${field}` });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        // Check if student ID or email already exists
        const existingStudent = await studentModel.findOne({
            $or: [
                { studentId: studentData.studentId },
                { email: studentData.email }
            ],
        });
        if (existingStudent) {
            return res.status(409).json({ message: "Student ID or email already exists" });
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
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation error", errors: validationErrors });
        }

        if (error.code === 11000) {
            // Handle duplicate key errors
            return res.status(409).json({ message: "Duplicate key error. A student with this unique field already exists." });
        }

        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Log in a student
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
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
        const { accessToken, refreshToken } = generateTokens(student.email, "15m", "7d");
        
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
                studentId: student.studentId
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};

export { createStudent, loginStudent };
