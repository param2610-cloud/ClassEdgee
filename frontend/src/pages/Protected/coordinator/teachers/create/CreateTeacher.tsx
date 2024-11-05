import React, { useState } from 'react';

const CreateProfileForm: React.FC = () => {
    const [formData, setFormData] = useState({
        personalInformation: {
            fullName: '',
            dateOfBirth: '',
            gender: '',
            contactNumber: '',
            email: '',
        },
        qualification: {
            highestDegree: '',
            specialization: '',
            universityInstitute: '',
            yearOfPassing: '',
        },
        professionalExperience: {
            totalYearsOfExperience: '',
            previousJobTitle: '',
            previousOrganization: '',
            duration: {
                startDate: '',
                endDate: '',
            },
        },
        subjectExpertise: {
            primarySubject: '',
            secondarySubjects: '',
        },
        additionalInformation: {
            address: '',
        },
        certifications: [] as string[],
        linkedinProfile: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        if (section === 'certifications') {
            setFormData((prevData) => ({
                ...prevData,
                [section]: [...prevData[section], value], // Adjust this if needed for multiple certs
            }));
        } else if (field) {
            setFormData((prevData) => ({
                ...prevData,
                [section]: {
                    ...prevData[section],
                    [field]: value,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [section]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
        // Here you can handle the submission, like sending it to an API
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            <input
                type="text"
                name="personalInformation.fullName"
                placeholder="Full Name"
                value={formData.personalInformation.fullName}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="date"
                name="personalInformation.dateOfBirth"
                placeholder="Date of Birth"
                value={formData.personalInformation.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <select
                name="personalInformation.gender"
                value={formData.personalInformation.gender}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <input
                type="text"
                name="personalInformation.contactNumber"
                placeholder="Contact Number"
                value={formData.personalInformation.contactNumber}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="email"
                name="personalInformation.email"
                placeholder="Email"
                value={formData.personalInformation.email}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />

            <h2 className="text-2xl font-bold mb-4">Qualification</h2>
            <input
                type="text"
                name="qualification.highestDegree"
                placeholder="Highest Degree"
                value={formData.qualification.highestDegree}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                name="qualification.specialization"
                placeholder="Specialization"
                value={formData.qualification.specialization}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                name="qualification.universityInstitute"
                placeholder="University/Institute"
                value={formData.qualification.universityInstitute}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="number"
                name="qualification.yearOfPassing"
                placeholder="Year of Passing"
                value={formData.qualification.yearOfPassing}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />

            <h2 className="text-2xl font-bold mb-4">Professional Experience</h2>
            <input
                type="number"
                name="professionalExperience.totalYearsOfExperience"
                placeholder="Total Years of Experience"
                value={formData.professionalExperience.totalYearsOfExperience}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                name="professionalExperience.previousJobTitle"
                placeholder="Previous Job Title"
                value={formData.professionalExperience.previousJobTitle}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                name="professionalExperience.previousOrganization"
                placeholder="Previous Organization"
                value={formData.professionalExperience.previousOrganization}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="date"
                name="professionalExperience.duration.startDate"
                placeholder="Start Date"
                value={formData.professionalExperience.duration.startDate}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="date"
                name="professionalExperience.duration.endDate"
                placeholder="End Date"
                value={formData.professionalExperience.duration.endDate}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />

            <h2 className="text-2xl font-bold mb-4">Subject Expertise</h2>
            <input
                type="text"
                name="subjectExpertise.primarySubject"
                placeholder="Primary Subject"
                value={formData.subjectExpertise.primarySubject}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                name="subjectExpertise.secondarySubjects"
                placeholder="Secondary Subjects (comma separated)"
                value={formData.subjectExpertise.secondarySubjects}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
            />

            <h2 className="text-2xl font-bold mb-4">Additional Information</h2>
            <input
                type="text"
                name="additionalInformation.address"
                placeholder="Address"
                value={formData.additionalInformation.address}
                onChange={handleChange}
                required
                className="w-full p-2 mb-4 border rounded"
            />

            <h2 className="text-2xl font-bold mb-4">Certifications</h2>
            <input
                type="file"
                name="certifications"
                placeholder="Certification File (e.g., cert1.pdf)"
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
            />

            <h2 className="text-2xl font-bold mb-4">LinkedIn Profile</h2>
            <input
                type="url"
                name="linkedinProfile"
                placeholder="LinkedIn Profile URL"
                value={formData.linkedinProfile}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
            />

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Submit
            </button>
        </form>
    );
};

export default CreateProfileForm;
