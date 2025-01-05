import mongoose from "mongoose";
const coordinatorSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    contactInfo: {
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true },
    },
    address: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    educationalQualifications: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    previousPositions: [String],
    dateOfJoining: { type: Date, required: true },
    department: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accessLevel: { type: String, default: "coordinator" },
    accountCreationDate: { type: Date, default: Date.now },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Principal",
        required: true,
    },
    refreshToken: { type: String },
    role: {
        type: String,
        default: "coordinator",
    },
});

export const coordinatorModel = mongoose.model(
    "Coordinator",
    coordinatorSchema
);
