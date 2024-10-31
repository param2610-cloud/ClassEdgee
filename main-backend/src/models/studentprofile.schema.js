import mongoose from "mongoose";

const studentSchema  = new mongoose.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
  
    // Contact Information
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
  
    // Academic Information
    studentId: { type: String, required: true, unique: true },
    enrollmentDate: { type: Date, required: true },
    grade: { type: String, required: true },
    section: { type: String },
    previousSchool: { type: String },
  
    // Parent/Guardian Information
    guardianName: { type: String, required: true },
    guardianRelation: { type: String, required: true },
    guardianContact: { type: String, required: true },
  
    // Face Recognition Data
    profile_image_link: { type: String, required: true },
  
    // Additional Information
    medicalConditions: [String],
    emergencyContact: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true }
    },
  
    // System Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

studentSchema.index({ studentId: 1, email: 1 });

export const studentModel = mongoose.model(
    "Student",
    studentSchema 
);

