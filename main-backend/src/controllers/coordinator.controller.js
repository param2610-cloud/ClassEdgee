import bcrypt from "bcrypt"
import { generateTokens } from "../utils/generate.js";

import { PrismaClient } from "@prisma/client";

const prisma =new  PrismaClient();

const loginCoordinator = async (req, res) => {
    try {
        const { college_uid, password } = req.body;

        // Input validation
        if (!college_uid || !password) {
            return res.status(400).send({
                message: "college_uid and password are required",
            });
        }

        // Find user by college_uid only
        const user = await prisma.users.findUnique({
            where: {
                college_uid: college_uid,
            },
            select: {
                password_hash: true,
                email: true,
                first_name: true,
                last_name: true,
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
            college_uid,
            "15m",
            "7d"
        );
        const UpdatedUser = await prisma.users.update({
            where: {
                college_uid: college_uid,
            },
            data: {
                refreshtoken: refreshToken,
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
        return res.status(200).json({
            message: "User logged in successfully",
            UpdatedUser,
            refreshToken,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }

}




export { loginCoordinator }