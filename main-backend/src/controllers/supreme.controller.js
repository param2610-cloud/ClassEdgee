import mongoose from "mongoose";
import { coordinatorModel } from "../models/coordinatorprofile.schema.js";
import { supremeModel } from "../models/supremeprofile.schema.js";
import {
    
    generateTokens
} from "../utils/generate.js";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const registersupreme = async (req, res) => {
    try {
        const { college_uid, password,email,role,firstname,lastname } = req.body;
        if (!college_uid || !password || !email  || !firstname || !lastname) {
            return res.status(400).send({
                message: "All fields are required",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdminUser =await prisma.users.create({
            data:{
                college_uid: college_uid,
                password_hash: hashedPassword,
                email: email,
                role: role?role:"admin",
                first_name: firstname,
                last_name: lastname,
            }
        })

        res.status(200).send({
            message: "Admin user created successfully",
            newAdminUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send( error);
    }
};
const loginsupreme = async (req, res) => {
    try {
        const { college_uid, password } = req.body;

        // Input validation
        if (!college_uid || !password) {
            return res.status(400).send({
                message: "college_uid and password are required",
            });
        }

        // Find user by college_uid only
        const finduser =await prisma.users.findUnique({
            where:{
                college_uid: college_uid},
                select:{
                    password_hash:true,
                    email:true,
                    first_name:true,
                    last_name:true
                }
        })

        if (!finduser) {
            // Use a generic message to prevent user enumeration
            return res.status(401).send({
                message: "No Admin exists with this college_uid",
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, finduser.password_hash);

        if (!isMatch) {
            return res.status(401).send({
                message: "Invalid credentials",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            college_uid,
            "2d",
            "7d"
        );
        const puttoken = await prisma.users.update({
            where:{
                college_uid: college_uid},
            data:{refreshtoken:refreshToken}
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
            user: {
                email: finduser.email,
                firstName: finduser.first_name,
                lastName: finduser.last_name,
                // Include other non-sensitive user data here
            },
            refreshToken,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "An error occurred during login" });
    }
};
const coordinatorcreate = async (req, res) => {
    try {
        const { password, ...coordinatorData } = req.body;

        // Validate password strength
        if (password && password.length < 8) {
            return res
                .status(400)
                .send({
                    message: "Password must be at least 8 characters long",
                });
        }

        // Check if college_uid or email already exists
        const existingcoordinator = await prisma.users.findUnique(
            {
                where: {
                    college_uid: coordinatorData.college_uid,
                },
            }
        );
        if (existingcoordinator) {
            return res
                .status(409)
                .send({ message: "college_uid or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newcoordinator = await prisma.users.create({
            data: {
                college_uid: coordinatorData.college_uid,
                password_hash: hashedPassword,
                email: coordinatorData.email,
                role: "coordinator",
                first_name: coordinatorData.firstName,
                last_name: coordinatorData.lastName,
            },
        });

        
        res.status(201).send({
            message: "coordinator created successfully",
            newcoordinator,
        });
    } catch (error) {
        console.error("Error in createcoordinator:", error);

        // Generic error handler
        res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { registersupreme, loginsupreme, coordinatorcreate };
