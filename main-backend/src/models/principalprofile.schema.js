import mongoose from "mongoose";

const principalSchema  = new mongoose.Schema({
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
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accessLevel: { type: String, default: "principal" },
    accountCreationDate: { type: Date, default: Date.now },
    refreshToken: { type: String },
    role:{
        type:String,
        default:"principal"
    }
});
export const principalModel = mongoose.model(
    "Principal",
    principalSchema 
);
