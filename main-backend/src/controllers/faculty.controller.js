//import {facultyprofileSchema} from '../models/facultyprofile.schema.js'

import facultyprofileSchema from "../models/facultyprofile.schema.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generate.js";
import { fastapidomain } from "../lib/domain.js";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const createFaculty = async (req, res) => {
    try {
        const {
            // User data
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            profilePicture,

            // Faculty specific data
            departmentId,
            employeeId,
            designation,
            expertise,
            qualifications,
            maxWeeklyHours,
            joiningDate,
            contractEndDate,
            researchInterests,
            publications,
        } = req.body;

        // Basic validation
        if (
            !email ||
            !password ||
            !firstName ||
            !lastName ||
            !employeeId ||
            !designation ||
            !departmentId
        ) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields",
            });
        }
        const college_id = employeeId;
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({
                success: false,
                message: "Invalid email format",
            });
        }

        // Check if department exists
        const department = await prisma.departments.findUnique({
            where: { department_id: departmentId },
        });

        if (!department) {
            return res.status(404).send({
                success: false,
                message: "Department not found",
            });
        }

        // Check if email already exists
        const existingUser = await prisma.users.findUnique({
            where: { college_uid:college_id },
        });

        if (existingUser) {
            return res.status(409).send({
                success: false,
                message: "Faculty already registered",
            });
        }

        

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user and faculty in a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create user
            const user = await prisma.users.create({
                data: {
                    uuid: uuidv4(),
                    email,
                    password_hash: passwordHash,
                    role: "faculty",
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                    profile_picture: profilePicture,
                    status: "active",
                    college_uid:college_id
                },
            });

            // Create faculty
            const faculty = await prisma.faculty.create({
                data: {
                    user_id: user.user_id,
                    department_id: departmentId,
                    designation,
                    expertise: expertise || [],
                    qualifications: qualifications || [],
                    max_weekly_hours: maxWeeklyHours || 40,
                    joining_date: new Date(joiningDate),
                    contract_end_date: contractEndDate
                        ? new Date(contractEndDate)
                        : null,
                    research_interests: researchInterests || [],
                    publications: publications || [],
                },
            });

            return { user, faculty };
        });

        return res.status(201).send({
            success: true,
            message: "Faculty created successfully",
            data: {
                userId: result.user.college_uid,
                facultyId: result.faculty.faculty_id,
                email: result.user.email,
                designation: result.faculty.designation,
            },
        });
    } catch (error) {
        console.error("Error creating faculty:", error);

        // Handle specific database errors
        if (error.code === "P2002") {
            return res.status(409).send({
                success: false,
                message: "Unique constraint violation",
                field: error.meta?.target?.[0],
            });
        }

        // Handle date parsing errors
        if (error instanceof Date && isNaN(error.getTime())) {
            return res.status(400).send({
                success: false,
                message: "Invalid date format",
            });
        }

        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};
const facultyblukupload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded" });
        }

        // Log the FastAPI domain and file details for debugging
        console.log("FastAPI Domain:", fastapidomain);
        console.log("File details:", {
            path: req.file.path,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
        });

        // Create form data
        const form = new FormData();
        form.append("file", fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
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
                validateStatus: false, // Don't throw error on non-2xx status
            }
        );

        // Clean up the temporary file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Handle non-200 responses from FastAPI
        if (response.status !== 200) {
            console.error("FastAPI Error:", response.data);
            return res.status(response.status).send({
                message: "Error from processing server",
                error: response.data,
            });
        }

        return res.status(200).send(response.data);
    } catch (error) {
        // Clean up on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Better error logging
        console.error("Error in bulk upload:", {
            message: error.message,
            code: error.code,
            response: error.response?.data,
        });

        // Handle different types of errors
        if (error.code === "ECONNREFUSED") {
            return res.status(503).send({
                message: "Processing server is not available",
                error: "Connection refused",
            });
        }

        if (error.code === "ETIMEDOUT") {
            return res.status(504).send({
                message: "Processing server timed out",
                error: "Request timeout",
            });
        }

        return res.status(500).send({
            message: "Error processing file",
            error: error.message,
        });
    }
};
// Log in a faculty
const loginfaculty = async (req, res) => {
    try {
        const { college_uid, password } = req.body;

        // Input validation
        if (!college_uid || !password) {
            return res
                .status(400)
                .send({ message: "college_uid and password are required" });
        }

        // Find faculty by email
        const faculty = await prisma.users.findUnique({
            where: {
                college_uid: college_uid,
            },
            include: {
                faculty: true
            }
        });
        if (!faculty || faculty.role !== "faculty") {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(
            faculty.college_uid,
            "2d",
            "7d"
        );

        // Update the faculty's refresh token
        await prisma.users.update({
            where: {
                college_uid: faculty.college_uid,
            },
            data: {
                refresh_token: refreshToken,
            },
        })
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
        return res.status(200).send({
            message: "User logged in successfully",
            faculty,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "An error occurred during login" });
    }
};
const listoffaculty = async (req, res) => {
    try {
        const facultys = await prisma.faculty.findMany({
            include: {
                users: true,
            },
        });
        res.status(200).send(facultys);
    } catch (error) {
        console.error("Error retrieving facultys:", error);
        res.status(500).send({ error: "Failed to retrieve facultys" });
    }
};

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
        if (updateData.gender == "F") {
            updateData.gender = "Female";
        } else if (updateData.gender == "M") {
            updateData.gender = "Male";
        }
        // Find and update the faculty
        const updatedfaculty = await facultyprofileSchema.findOneAndUpdate(
            { _id: facultyId },
            { $set: updateData },
            {
                new: true, // Return the updated document
                runValidators: true, // Run schema validators on update
            }
        );

        // Check if faculty exists
        if (!updatedfaculty) {
            return res.status(404).send({
                success: false,
                message: "faculty not found",
            });
        }

        return res.status(200).send({
            success: true,
            message: "faculty updated successfully",
            data: updatedfaculty,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).send({
                success: false,
                message: "Validation Error",
                errors: Object.values(error.errors).map((err) => err.message),
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).send({
                success: false,
                message: "Duplicate field value entered",
                field: Object.keys(error.keyPattern)[0],
            });
        }

        // Handle other errors
        return res.status(500).send({
            success: false,
            message: "Error updating faculty",
            error: error.message,
        });
    }
};
const uniquefaculty = async (req, res) => {
    try {
        console.log("adsfad");

        const facultyId = req.params.id;
        console.log(facultyId);

        const faculty = await facultyprofileSchema.findOne({ _id: facultyId });
        console.log(faculty);

        if (!faculty) {
            return res.status(404).send({
                success: false,
                message: "faculty not found",
            });
        }
        return res.status(200).send({
            success: true,
            message: "faculty found successfully",
            data: faculty,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Error finding faculty",
            error: error.message,
        });
    }
};

const deletefaculty = async (req, res) => {
    try {
        const facultyId = req.params.id;
        const deletedfaculty =
            await facultyprofileSchema.findByIdAndDelete(facultyId);
        if (!deletedfaculty) {
            return res.status(404).send({
                success: false,
                message: "faculty not found",
            });
        }
        return res.status(200).send({
            success: true,
            message: "faculty deleted successfully",
            data: deletedfaculty,
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Error deleting faculty",
            error: error.message,
        });
    }
};

export {
    createFaculty,
    loginfaculty,
    facultyblukupload,
    listoffaculty,
    editfaculty,
    uniquefaculty,
    deletefaculty,
};
