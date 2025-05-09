import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generate.js";
import fs from "fs";
import { fastapidomain } from "../lib/domain.js";
import axios from "axios";
import FormData from "form-data";


const prismaClient = new PrismaClient();

// Create new student
const createStudent = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            departmentId,
            enrollmentNumber,
            batchYear,
            currentSemester,
            guardianName,
            guardianContact,
            collegeUid,
            profilePictureUrl,
            institution_id
        } = req.body;

        // Check for existing email
        const existingEmail = await prismaClient.users.findUnique({
            where: { email: email }
        });
        if (existingEmail) {
            return res.status(400).send({
                success: false,
                message: "Email already exists",
                field: "email"
            });
        }

        // Check for existing enrollment number
        const existingEnrollment = await prismaClient.students.findUnique({
            where: { enrollment_number: enrollmentNumber }
        });
        if (existingEnrollment) {
            return res.status(400).send({
                success: false,
                message: "Enrollment number already exists",
                field: "enrollmentNumber"
            });
        }

        // Check for existing college UID
        const existingCollegeUid = await prismaClient.users.findUnique({
            where: { college_uid: collegeUid }
        });
        if (existingCollegeUid) {
            return res.status(400).send({
                success: false,
                message: "College UID already exists",
                field: "collegeUid"
            });
        }

        // Hash the default password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user first
        const user = await prismaClient.users.create({
            data: {
                email,
                password_hash: hashedPassword,
                role: "student",
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                college_uid: collegeUid,
                status: "active",
                profile_picture: profilePictureUrl,
                institution_id: institution_id
            },
        });

        // Create student profile
        const student = await prismaClient.students.create({
            data: {
                user_id: user.user_id,
                enrollment_number: enrollmentNumber,
                department_id: departmentId,
                batch_year: parseInt(batchYear),
                current_semester: parseInt(currentSemester),
                guardian_name: guardianName,
                guardian_contact: guardianContact,
            },
        });

        res.status(201).send({
            success: true,
            message: "Student created successfully",
            data: student,
        });
    } catch (error) {
        console.error("Error creating student:", error);

        // Handle Prisma unique constraint errors
        if (error.code === 'P2002') {
            const field = error.meta.target[0];
            let message = '';

            switch(field) {
                case 'email':
                    message = 'Email is already in use';
                    break;
                case 'college_uid':
                    message = 'College UID is already in use';
                    break;
                case 'enrollment_number':
                    message = 'Enrollment number is already in use';
                    break;
                default:
                    message = `${field} is already in use`;
            }

            return res.status(400).send({
                success: false,
                message: message,
                field: field,
                errorCode: error.code
            });
        }

        // Handle other potential errors
        res.status(500).send({
            success: false,
            message: "Failed to create student",
            error: error.message,
        });
    }
};

// Student login
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).send({ 
                message: "Email and password are required" 
            });
        }

        // Find student by email
        const student = await prismaClient.users.findUnique({
            where: {
                email: email,
                role: "student", 
            },
            include: {
                students: true,
                departments: true
            }
        });

        if (!student || student.role !== "student") {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(
            student.email,
            "2d",
            "7d"
        );

        // Update student's refresh token and last login
        const userData = await prismaClient.users.update({
            where: {
                email: student.email,
            },
            data: {
                refreshtoken: refreshToken,
                last_login: new Date()
            },
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
                profile_picture: true,
                institution_id: true,
                students: true,
                role: true
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

        res.cookie("institution_id", student.institution_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Send response
        return res.status(200).send({
            message: "Student logged in successfully",
            student,
            userData,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "An error occurred during login" });
    }
};
// List all students
const listOfStudents = async (req, res) => {
    try {
        const { 
            page = 1, 
            pageSize = 50, 
            search = '',
            department = '',
            semester = '',
            batchYear = '',
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Convert page and pageSize to numbers
        const pageNumber = parseInt(page);
        const pageSizeNumber = parseInt(pageSize);

        // Prepare dynamic filtering
        const whereCondition = {
            ...(search ? {
                OR: [
                    { users: { first_name: { contains: search, mode: 'insensitive' } } },
                    { users: { last_name: { contains: search, mode: 'insensitive' } } },
                    { users: { college_uid: { contains: search, mode: 'insensitive' } } }
                ]
            } : {}),
            ...(department ? { departments: { department_name: department } } : {}),
            ...(semester ? { current_semester: parseInt(semester) } : {}),
            ...(batchYear ? { batch_year: parseInt(batchYear) } : {})
        };

        // Fetch total count for pagination
        const totalStudents = await prismaClient.students.count({
            where: whereCondition
        });

        // Fetch paginated students
        const students = await prismaClient.students.findMany({
            where: whereCondition,
            include: {
                departments: true,
                users: true,
                sections: true,
            },
            orderBy: {
                [sortBy]: sortOrder
            },
            skip: (pageNumber - 1) * pageSizeNumber,
            take: pageSizeNumber
        });

        res.status(200).send({
            success: true,
            data: students,
            pagination: {
                total: totalStudents,
                page: pageNumber,
                pageSize: pageSizeNumber,
                totalPages: Math.ceil(totalStudents / pageSizeNumber)
            }
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch students",
            error: error.message,
        });
    }
};

// Edit student
const editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // First update user data
        await prismaClient.users.update({
            where: { user_id: parseInt(id) },
            data: {
                first_name: updateData.firstName,
                last_name: updateData.lastName,
                email: updateData.email,
                phone_number: updateData.phoneNumber,
                college_uid: updateData.collegeUid,
                profile_picture: updateData.profilePictureUrl
            },
        });

        // Then update student specific data
        const student = await prismaClient.students.update({
            where: { user_id: parseInt(id) },
            data: {
                department_id: updateData.departmentId,
                enrollment_number: updateData.enrollmentNumber,
                batch_year: updateData.batchYear,
                current_semester: updateData.currentSemester,
                guardian_name: updateData.guardianName,
                guardian_contact: updateData.guardianContact,
                profile_picture: updateData.profilePicture || undefined
            },
        });

        // Fetch the updated student data with relations
        const updatedStudent = await prismaClient.students.findUnique({
            where: { user_id: parseInt(id) },
            include: {
                users: true,
                departments: true
            }
        });

        res.status(200).send({
            success: true,
            message: "Student updated successfully",
            data: updatedStudent,
        });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).send({
            success: false,
            message: "Failed to update student",
            error: error.message,
        });
    }
};

const uniqueStudent = async (req, res) => {
    try {
        console.log("uniqueStudent");
        
        const { id } = req.params;
        const student = await prismaClient.users.findUnique({
            where: { user_id: parseInt(id) },
            include: {
                students: {
                    include:{
                        sections:{
                            include:{
                                departments:true,
                                notes:true,
                                
                            }
                        }
                    }
                },
                institutions: true,
            }
        });

        if (!student) {
            return res.status(404).send({
                success: false,
                message: "Student not found",
            });
        }

        res.status(200).send({
            success: true,
            data: student,
        });
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch student",
            error: error.message,
        });
    }
};


// Delete student
const deletestudent = async (req, res) => {
    try {
        const { id } = req.params;

        // First find the student to get user_id
        const student = await prismaClient.students.findUnique({
            where: { user_id: parseInt(id) },
        });

        if (!student) {
            return res.status(404).send({
                success: false,
                message: "Student not found",
            });
        }

        // Delete student record
        await prismaClient.students.delete({
            where: { user_id: parseInt(id) },
        });

        // Delete user record
        await prismaClient.users.delete({
            where: { user_id: parseInt(id) },
        });

        res.status(200).send({
            success: true,
            message: "Student deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).send({
            success: false,
            message: "Failed to delete student",
            error: error.message,
        });
    }
};
const studentblukupload = async (req, res) => {
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
            ` ${fastapidomain}/student/process-student-excel`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                },
                timeout: 600000, // 30 second timeout
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
const listOfStudentsOfSection = async (req,res)=>{
    try {
        const { section_id } = req.params;
        const students = await prismaClient.students.findMany({
            where: {
                sections: {
                    section_id: parseInt(section_id),
                },
            },
            include: {
                users: true,
                sections: true,
            },
        });
        res.status(200).send({
            students,
        });
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch student",
            error: error.message,
        });
    }
}
const listOfStudentsOfDepartment = async (req,res)=>{
    try {
        console.log("listOfStudentsOfDepartment");
        
        const { department_id } = req.params;
        const students = await prismaClient.students.findMany({
            where: {
                departments: {
                    department_id: parseInt(department_id),
                },
            },
            include: {
                users: true,
                sections: true,
            },
        });
        res.status(200).send({
            students,
        });
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch student",
            error: error.message,
        });
    }
}

export {
    createStudent,
    loginStudent,
    listOfStudents,
    editStudent,
    uniqueStudent,
    deletestudent,
    studentblukupload,
    listOfStudentsOfSection,
    listOfStudentsOfDepartment
};
