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
            profilePictureUrl,

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
            institute_id
        } = req.body;
        // Basic validation
        console.log(req.body);
        if (
            !email ||
            !password ||
            !firstName ||
            !lastName ||
            !employeeId ||
            !designation ||
            !departmentId ||
            !institute_id
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
            where: { college_uid: college_id },
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
                    profile_picture: profilePictureUrl,
                    status: "active",
                    college_uid: college_id,
                    institution_id:institute_id
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
            ` ${fastapidomain}/faculty/process-faculty-excel`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                },
                timeout: 30000, // 30 second timeout
                validateStatus: false, // Don't throw error on non-2xx status
            }
        );
        console.log(response.data);
        response.data;
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
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res
                .status(400)
                .send({ message: "email and password are required" });
        }

        // Find faculty by email
        const faculty = await prisma.users.findUnique({
            where: {
                email: email,
                role: "faculty",
            },
            include: {
                faculty: true,
            },
        });
        if (!faculty || faculty.role !== "faculty") {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, faculty.password_hash);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(
            faculty.email,
            "2d",
            "7d"
        );

        // Update the faculty's refresh token
        const userData = await prisma.users.update({
            where: {
                email: faculty.email,
            },
            data: {
                refreshtoken: refreshToken,
                last_login : new Date()
            },
            select:{
                user_id:true,
                first_name:true,
                last_name:true,
                email:true,
                phone_number:true,
                profile_picture:true,
                institution_id:true,
                faculty : true,
                role:true
            }
        });
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
        res.cookie("institution_id", faculty.institution_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Send response
        return res.status(200).send({
            message: "User logged in successfully",
            faculty,
            userData,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "An error occurred during login" });
    }
};
const listoffaculty = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 8,
            search = "",
            department = "",
            designation = "",
            sortBy = "created_at",
            sortOrder = "desc"
        } = req.query;

        // Convert page and pageSize to numbers
        const pageNumber = parseInt(page);
        const limit = parseInt(pageSize);
        const offset = (pageNumber - 1) * limit;

        // Build the where clause based on search and filters
        let whereClause = {};
        
        if (search) {
            whereClause = {
                OR: [
                    {
                        users: {
                            OR: [
                                { college_uid: { contains: search, mode: 'insensitive' } },
                                { first_name: { contains: search, mode: 'insensitive' } },
                                { last_name: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } }
                            ]
                        }
                    }
                ]
            };
        }

        if (department) {
            whereClause = {
                ...whereClause,
                departments: {
                    department_name: {
                        equals: department,
                        mode: 'insensitive'
                    }
                }
            };
        }

        if (designation) {
            whereClause = {
                ...whereClause,
                designation: {
                    equals: designation,
                    mode: 'insensitive'
                }
            };
        }

        // Build the orderBy clause
        let orderByClause = {};
        
        // Handle different sort fields
        switch (sortBy) {
            case 'name':
                orderByClause = {
                    users: {
                        first_name: sortOrder
                    }
                };
                break;
            case 'department':
                orderByClause = {
                    departments: {
                        department_name: sortOrder
                    }
                };
                break;
            case 'joining_date':
                orderByClause = {
                    joining_date: sortOrder
                };
                break;
            default:
                orderByClause = {
                    created_at: sortOrder
                };
        }

        // Get total count for pagination
        const totalCount = await prisma.faculty.count({
            where: whereClause
        });

        // Get faculty data with pagination, filtering, and sorting
        const facultys = await prisma.faculty.findMany({
            where: whereClause,
            include: {
                users: {
                    select: {
                        user_id: true,
                        college_uid: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true,
                        profile_picture: true
                    }
                },
                departments: {
                    select: {
                        department_id: true,
                        department_name: true
                    }
                }
            },
            orderBy: orderByClause,
            skip: offset,
            take: limit
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            data: facultys,
            pagination: {
                total: totalCount,
                page: pageNumber,
                pageSize: limit,
                totalPages
            }
        });

    } catch (error) {
        console.error("Error retrieving faculty:", error);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve faculty",
            details: error.message
        });
    }
};


const editFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Start transaction to update both user and faculty
        const result = await prisma.$transaction(async (tx) => {
            // Update user details
            const updatedUser = await tx.users.update({
                where: { user_id: Number(id) },
                data: {
                    first_name: data.user.first_name,
                    last_name: data.user.last_name,
                    email: data.user.email,
                    phone_number: data.user.phone_number,
                    profile_picture: data.user.profile_picture,
                },
            });

            // Update faculty details
            const updatedFaculty = await tx.faculty.update({
                where: { user_id: Number(id) },
                data: {
                    department_id: data.faculty.department_id,
                    designation: data.faculty.designation,
                    expertise: data.faculty.expertise,
                    qualifications: data.faculty.qualifications,
                    max_weekly_hours: data.faculty.max_weekly_hours,
                    contract_end_date: data.faculty.contract_end_date,
                    research_interests: data.faculty.research_interests,
                    publications: data.faculty.publications,
                    updated_at: new Date(),
                },
            });

            return { user: updatedUser, faculty: updatedFaculty };
        });

        res.status(200).json({
            success: true,
            message: "Faculty profile updated successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error updating faculty:", error);
        res.status(500).json({
            success: false,
            message: "Error updating faculty profile",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        });
    }
};

const getUniqueFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        
        const faculty = await prisma.users.findUnique({
            where: { user_id: parseInt(id) },
            include: {
                faculty: true,
                departments:true
            },
        });

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found",
            });
        }

        res.status(200).json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        console.error("Error fetching faculty:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching faculty details",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
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

const updateFacultyExpertise = async (req, res) => {
    try {
        const { faculty_id,subject_id } = req.params;
        
        const updatedFaculty = await prisma.faculty_subject_mapping.create({
            data:{
                faculty_id: Number(faculty_id),
                subject_id: Number(subject_id)
            }
        });

        res.status(200).json({
            success: true,
            message: "Faculty expertise updated successfully",
            data: updatedFaculty
        });

    } catch (error) {
        console.error("Error updating faculty expertise:", error);
        res.status(500).json({
            success: false,
            message: "Error updating faculty expertise",
            error: error.message
        });
    }
};
// API endpoint to delete faculty-subject mapping
const deleteFacultyExpertise = async (req, res) => {
    try {
        const { faculty_id, subject_id } = req.params;
        console.log(faculty_id,subject_id);
        
        const deletedMapping = await prisma.faculty_subject_mapping.delete({
            where: {
                faculty_id_subject_id: {
                    faculty_id: parseInt(faculty_id),
                    subject_id: parseInt(subject_id)
                }
            }
        });
        
        res.status(200).json({
            success: true,
            message: "Expertise mapping deleted successfully",
            data: deletedMapping
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting expertise mapping",
            error: error.message
        });
    }
};
 const getFacultyClasses = async (req, res) => {
    try {
        const facultyId = parseInt(req.params.facultyId);
        console.log(facultyId);
        
        const classes = await prisma.classes.findMany({
            where: {
                faculty_id: facultyId,
                date_of_class: {
                    lte: new Date() // Only past classes
                }
            },
            include: {
                courses: {
                    select: {
                        course_name: true,
                        course_code: true
                    }
                },
                sections: {
                    select: {
                        section_name: true,
                        batch_year: true
                    }
                },
                rooms: {
                    select: {
                        room_number: true
                    }
                },
                timeslots: {
                    select: {
                        start_time: true,
                        end_time: true,
                        day_of_week: true
                    }
                },
                _count: {
                    select: {
                        attendance: true
                    }
                }
            },
            orderBy: {
                date_of_class: 'desc'
            }
        });

        // Process classes to include formatted information
        const processedClasses = classes.map(cls => ({
            id: cls.class_id,
            courseName: cls.courses.course_name,
            courseCode: cls.courses.course_code,
            section: cls.sections.section_name,
            batchYear: cls.sections.batch_year,
            room: cls.rooms.room_number,
            dateOfClass: cls.date_of_class,
            attendanceCount: cls._count.attendance,
            timeSlot: {
                start: cls.timeslots.start_time,
                end: cls.timeslots.end_time,
                dayOfWeek: cls.timeslots.day_of_week
            },
            semester: cls.semester,
            academicYear: cls.academic_year
        }));

        res.json({ classes: processedClasses });
    } catch (error) {
        console.error('Error in getFacultyClasses:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
};


export {
    createFaculty,
    loginfaculty,
    facultyblukupload,
    listoffaculty,
    editFaculty,
    getUniqueFaculty,
    deletefaculty,
    updateFacultyExpertise,
    deleteFacultyExpertise,
    getFacultyClasses
};
