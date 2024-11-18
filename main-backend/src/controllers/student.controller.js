import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateTokens } from "../utils/generate.js";

const prismaClient = new PrismaClient();

// Create new student
const createStudent = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            enrollment_number,
            department_id,
            batch_year,
            current_semester,
            guardian_name,
            guardian_contact,
            college_uid,
            profile_picture
        } = req.body;

        // Hash the default password
        const hashedPassword = await bcrypt.hash("classedgee", 10);

        // Create user first
        const user = await prismaClient.users.create({
            data: {
                email,
                password_hash: hashedPassword,
                role: "student",
                first_name,
                last_name,
                phone_number,
                college_uid,
                status: "active",
                profile_picture
            },
        });

        // Create student profile
        const student = await prismaClient.students.create({
            data: {
                user_id: user.user_id,
                enrollment_number,
                department_id,
                batch_year,
                current_semester,
                guardian_name,
                guardian_contact,
            },
        });

        res.status(201).send({
            success: true,
            message: "Student created successfully",
            data: student,
        });
    } catch (error) {
        console.error("Error creating student:", error);
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
        const { college_uid, password } = req.body;

        // Find user by college_uid
        const user = await prismaClient.users.findUnique({
            where: {
                college_uid: college_uid,
                role: "student",
            },
        });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Student not found",
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );
        if (!validPassword) {
            return res.status(401).send({
                success: false,
                message: "Invalid credentials",
            });
        }

        const { accessToken, refreshToken } = generateTokens(
            college_uid,
            "2d",
            "7d"
        );

        // Update last login
        await prismaClient.users.update({
            where: { user_id: user.user_id },
            data: { last_login: new Date(), refreshtoken: refreshToken },
        });
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

        res.status(200).send({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error("Error in student login:", error);
        res.status(500).send({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// List all students
const listofstudent = async (req, res) => {
    try {
        const students = await prismaClient.students.findMany({
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true,
                        college_uid: true,
                    },
                },
                departments: {
                    select: {
                        department_name: true,
                    },
                },
            },
        });

        res.status(200).send({
            success: true,
            data: students,
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
        if (
            updateData.first_name ||
            updateData.last_name ||
            updateData.email ||
            updateData.phone_number
        ) {
            await prismaClient.users.update({
                where: { user_id: parseInt(id) },
                data: {
                    first_name: updateData.first_name,
                    last_name: updateData.last_name,
                    email: updateData.email,
                    phone_number: updateData.phone_number,
                },
            });
        }

        // Then update student specific data
        const student = await prismaClient.students.update({
            where: { user_id: parseInt(id) },
            data: {
                department_id: updateData.department_id,
                current_semester: updateData.current_semester,
                guardian_name: updateData.guardian_name,
                guardian_contact: updateData.guardian_contact,
            },
        });

        res.status(200).send({
            success: true,
            message: "Student updated successfully",
            data: student,
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

// Get unique student
const uniquestudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await prismaClient.students.findUnique({
            where: { user_id: parseInt(id) },
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true,
                        college_uid: true,
                    },
                },
                departments: {
                    select: {
                        department_name: true,
                    },
                },
            },
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
export{
    createStudent,
    loginStudent,
    listofstudent,
    editStudent,
    uniquestudent,
    deletestudent,
};
