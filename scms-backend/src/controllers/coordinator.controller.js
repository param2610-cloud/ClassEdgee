import mongoose from "mongoose";
import { coordinatorModel } from "../models/coordinatorprofile.schema.js";
import { principalModel } from "../models/principalprofile.schema.js";
import bcrypt from "bcrypt"
const createCoordinator = async (req, res) => {
    try {
        const { password, ...coordinatorData } = req.body;

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
            "department",
            "reportingTo",
        ];
        for (const field of requiredFields) {
            if (!coordinatorData[field]) {
                return res
                    .status(400)
                    .json({ message: `Missing required field: ${field}` });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(coordinatorData.contactInfo.email)) {
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

        // Check if username or email already exists
        const existingCoordinator = await coordinatorModel.findOne({
            $or: [
                { username: coordinatorData.username },
                { "contactInfo.email": coordinatorData.contactInfo.email },
            ],
        });
        if (existingCoordinator) {
            return res
                .status(409)
                .json({ message: "Username or email already exists" });
        }

        // Verify if the reportingTo principal exists
        const reportingPrincipal = await principalModel.findById(
            coordinatorData.reportingTo
        );
        if (!reportingPrincipal) {
            return res
                .status(400)
                .json({ message: "Reporting principal not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCoordinator = new coordinatorModel({
            ...coordinatorData,
            password: hashedPassword,
        });

        await newCoordinator.save();
        res.status(201).json({
            message: "Coordinator created successfully",
            coordinatorId: newCoordinator._id,
        });
    } catch (error) {
        console.error("Error in createCoordinator:", error);

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
                        "Duplicate key error. A coordinator with this unique field already exists.",
                });
        }

        if (error instanceof bcrypt.BcryptError) {
            // Handle bcrypt-specific errors
            return res.status(500).json({ message: "Error hashing password" });
        }

        if (error instanceof mongoose.Error.CastError) {
            // Handle invalid ObjectId errors
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Generic error handler
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};


export { createCoordinator }