import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
    {
        personalInformation: {
            fullName: {
                type: String,
                required: true,
            },
            dateOfBirth: {
                type: Date,
                required: true,
            },
            gender: {
                type: String,
                enum: ["Male", "Female", "Other"],
                required: true,
            },
            contactNumber: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
                unique: true,
            },
        },
        qualification: {
            highestDegree: {
                type: String,
                required: true,
            },
            specialization: {
                type: String,
                required: true,
            },
            universityInstitute: {
                type: String,
                required: true,
            },
            yearOfPassing: {
                type: Number,
                required: true,
            },
        },
        professionalExperience: {
            totalYearsOfExperience: {
                type: Number,
                required: true,
            },
            previousJobTitle: {
                type: String,
                required: true,
            },
            previousOrganization: {
                type: String,
                required: true,
            },
            duration: {
                startDate: {
                    type: Date,
                    required: true,
                },
                endDate: {
                    type: Date,
                    required: true,
                },
            },
        },
        subjectExpertise: {
            primarySubject: {
                type: String,
                required: true,
            },
            secondarySubjects: {
                type: String,
            },
            certifications: {
                type: [String], // Store file paths or URLs
            },
        },
        additionalInformation: {
            address: {
                type: String,
                required: true,
            },
            cv: {
                type: String,
            },
            linkedinProfile: {
                type: String,
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
