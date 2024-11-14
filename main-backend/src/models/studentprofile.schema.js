import mongoose from "mongoose";

const studentSchema  = new mongoose.Schema({
    firstName: { type: String, required: false },
    middleName: { type: String },
    lastName: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    gender: { type: String, required: false, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
  
    // Contact Information
    email: { type: String, required: false, unique: true },
    phoneNumber: { type: String, required: false },
    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: false }
    },
  
    // Academic Information
    studentId: { type: String, required: true, unique: true },
    enrollmentDate: { type: Date, required: false },
    grade: { type: String, required: false },
    section: { type: String },
    previousSchool: { type: String },
  
    // Parent/Guardian Information
    guardianName: { type: String, required: false },
    guardianRelation: { type: String, required: false },
    guardianContact: { type: String, required:false },
  
    // Face Recognition Data
    profile_image_link: { type: String, required: false },
  
    // Additional Information
    medicalConditions: [String],
    emergencyContact: {
      name: { type: String, required: false },
      relation: { type: String, required: false },
      phone: { type: String, required: false }
    },

    //login credential
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  
    // System Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to set username and password
studentSchema.pre('save', function(next) {
    // Set username to studentId
    this.username = this.studentId;
    
    // Format password from date of birth if it exists
    if (this.dateOfBirth) {
        const dob = new Date(this.dateOfBirth);
        const day = String(dob.getDate()).padStart(2, '0');
        const month = String(dob.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const year = dob.getFullYear();
        
        this.password = `${day}${month}${year}`;
    }
    
    next();
});

studentSchema.index({ studentId: 1, email: 1 });

export const studentModel = mongoose.model(
    "Student",
    studentSchema 
);