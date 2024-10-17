import mongoose from "mongoose";
import { principalModel } from "../models/principalprofile.schema.js";
import { supremeModel } from "../models/supremeprofile.schema.js";
import {
    generatePassword,
    generateTokens,
    generateusername,
} from "../utils/generate.js";
import bcrypt from "bcrypt";

const registersupreme = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "username and password are required",
            });
        }
        console.log("reached");
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await supremeModel.create({
            username: username,
            password: hashedPassword,
        });
        res.status(200).json({
            message: "user created successfully",
            newUser,
        });
    } catch (error) {
        console.log(error);
        res.send(500, error);
    }
};
const loginsupreme = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Input validation
        if (!username || !password) {
            return res.status(400).json({
                message: "User ID and password are required",
            });
        }

        // Find user by username only
        const user = await supremeModel.findOne({ username });

        if (!user) {
            // Use a generic message to prevent user enumeration
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            username,
            "15m",
            "7d"
        );
        const UpdatedUser = await supremeModel.findOneAndUpdate(
            { username: username },
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
                username: user.username,
                role: user.role,
                // Include other non-sensitive user data here
            },
            refreshToken,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};
const principalcreate = async (req, res) => {
    try {
        const { password, ...principalData } = req.body;

        // Validate required fields
        const requiredFields = [
            "fullName",
            "dateOfBirth",
            "gender",
            "contactInfo",
            "address",
            "employeeId",
            "educationalQualifications",
            "yearsOfExperience",
            "dateOfJoining",
            "username",
        ];
        for (const field of requiredFields) {
            if (!principalData[field]) {
                return res
                    .status(400)
                    .json({ message: `Missing required field: ${field}` });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(principalData.contactInfo.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password strength
        if (password && password.length < 8) {
            return res
                .status(400)
                .json({
                    message: "Password must be at least 8 characters long",
                });
        }

        // Check if username or email already exists
        const existingPrincipal = await principalModel.findOne({
            $or: [
                { username: principalData.username },
                { "contactInfo.email": principalData.contactInfo.email },
            ],
        });
        if (existingPrincipal) {
            return res
                .status(409)
                .json({ message: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPrincipal = new principalModel({
            ...principalData,
            password: hashedPassword,
        });

        await newPrincipal.save();
        res.status(201).json({
            message: "Principal created successfully",
            principalId: newPrincipal._id,
        });
    } catch (error) {
        console.error("Error in createPrincipal:", error);

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
                        "Duplicate key error. A principal with this unique field already exists.",
                });
        }

        if (error instanceof bcrypt.BcryptError) {
            // Handle bcrypt-specific errors
            return res.status(500).json({ message: "Error hashing password" });
        }

        // Generic error handler
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { registersupreme, loginsupreme, principalcreate };
