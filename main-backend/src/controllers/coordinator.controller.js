import bcrypt from "bcrypt"
import { generateTokens } from "../utils/generate.js";

import { PrismaClient } from "@prisma/client";

const prisma =new  PrismaClient();

const loginCoordinator = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).send({
                message: "email and password are required",
            });
        }

        // Find user by college_uid only
        const user = await prisma.users.findUnique({
            where: {
                email: email,
            },
            select: {
                password_hash: true,
                college_uid: true,
                first_name: true,
                last_name: true,
                email:true,
                institution_id:true
            },
        })

        if (!user) {
            // Use a generic message to prevent user enumeration
            return res.status(401).send({
                message: "Invalid credentials",
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            user.email,
            "2d",
            "7d"
        );
        const UpdatedUser = await prisma.users.update({
            where: {
                email: email,
            },
            data: {
                refreshtoken: refreshToken,
                last_login: new Date()
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
        res.cookie("institution_id", user.institution_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Send response
        return res.status(200).json({
            message: "User logged in successfully",
            refreshToken,
            accessToken,
            user:{
                institutionId:user.institution_id
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }

}




export { loginCoordinator }