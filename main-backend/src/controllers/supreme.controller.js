import {
    generateTokens
} from "../utils/generate.js";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { getDepartments } from "../utils/departments.js"; // Import the utility function

const prisma = new PrismaClient();

const registerInstitution = async (req, res) => {
    try {
        const { user_user_id, user_password_hash,user_email,user_role="admin",user_firstname,user_lastname,user_profile_picture,user_phone_number,institution_name,institution_code,institution_address,institution_contact_email,institution_contact_phone,institution_license_type="premium" } = req.body;
        console.log("Registering institution with data:", {
            user_user_id,
            user_email,
            user_role,
            user_firstname,
            user_lastname,
            user_profile_picture,
            user_phone_number,
            institution_name,
            institution_code,
            institution_address,
            institution_contact_email,
            institution_contact_phone,
            institution_license_type
        });
        if (!user_user_id || !user_password_hash || !user_email  || !user_firstname || !user_lastname || !user_profile_picture || !user_phone_number || !institution_name || !institution_code || !institution_address || !institution_contact_email || !institution_contact_phone || !institution_license_type) {
            return res.status(400).send({
                message: "All fields are required",
            });
        }
        const hashedPassword = await bcrypt.hash(user_password_hash, 10);

        const newInstitution = await prisma.institutions.create({
            data:{
                name: institution_name,
                code: institution_code,
                address: institution_address,
                contact_email: institution_contact_email,
                contact_phone: institution_contact_phone,
                license_type: institution_license_type,
            }
        })
        const newAdminUser =await prisma.users.create({
            data:{
                college_uid: user_user_id,
                password_hash: hashedPassword,
                email: user_email,
                role: user_role?user_role:"admin",
                first_name: user_firstname,
                last_name: user_lastname,
                profile_picture:user_profile_picture,
                phone_number: user_phone_number,
                institution_id: newInstitution.institution_id
            }
        })

        const departments = await getDepartments(); // Use the utility function

        res.status(200).send({
            message: "Institution and Instituition's admin created successfully",
            newAdminUser,
        });
    } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            const target = error.meta.target.join(', ');
            return res.status(400).send({
                message: `Unique constraint failed on the fields: (${target})`,
            });
        }
        res.status(500).send({
            message: "An error occurred during registration",
            error: error.message,
        });
    }
};
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).send({
                message: "college_uid and password are required",
            });
        }

        // Find user by college_uid only
        const finduser =await prisma.users.findUnique({
            where:{
                email: email,
                role:"admin"
            },
                select:{
                    password_hash:true,
                    email:true,
                    first_name:true,
                    last_name:true,
                    institution_id:true,
                    institutions:true,
                    role:true
                }
        })

        if (!finduser) {
            // Use a generic message to prevent user enumeration
            return res.status(401).send({
                message: "No Admin exists with this Email",
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, finduser.password_hash);

        if (!isMatch) {
            return res.status(401).send({
                message: "Invalid credentials",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            finduser.email,
            "2d",
            "7d"
        );
        const puttoken = await prisma.users.update({
            where:{
                email: email},
            data:{refreshtoken:refreshToken,
                last_login: new Date(),
            }
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
        res.cookie("institution_id", finduser.institution_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        const departments = await getDepartments(); // Use the utility function
        
        // Send response
        return res.status(200).send({
            message: "User logged in successfully",
            userData: {
                email: finduser.email,
                firstName: finduser.first_name,
                lastName: finduser.last_name,
                institution_id: finduser.institution_id,
                role:finduser.role
                // Include other non-sensitive user data here
            },
            refreshToken,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({
            message: "An error occurred during login",
            error: error.message,
        });
    }
};
const coordinatorcreate = async (req, res) => {
    try {
        const { password, ...coordinatorData } = req.body;

        // Input validation
        if (!coordinatorData.firstName || !coordinatorData.lastName) {
            return res.status(400).send({
                message: "First name and last name are required",
                errorType: "VALIDATION_ERROR"
            });
        }

        if (!coordinatorData.email) {
            return res.status(400).send({
                message: "Email is required",
                errorType: "VALIDATION_ERROR"
            });
        }

        if (!coordinatorData.college_uid) {
            return res.status(400).send({
                message: "College UID is required",
                errorType: "VALIDATION_ERROR"
            });
        }

        if (!password) {
            return res.status(400).send({
                message: "Password is required",
                errorType: "VALIDATION_ERROR"
            });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).send({
                message: "Password must be at least 8 characters long",
                errorType: "PASSWORD_STRENGTH_ERROR"
            });
        }

        // Check if email already exists
        const existingEmail = await prisma.users.findUnique({
            where: { email: coordinatorData.email }
        });

        if (existingEmail) {
            return res.status(409).send({
                message: "Email address is already registered",
                errorType: "DUPLICATE_EMAIL"
            });
        }

        // Check if college_uid already exists
        const existingUid = await prisma.users.findFirst({
            where: { 
                college_uid: coordinatorData.college_uid,
                institution_id: coordinatorData.institution_id
            }
        });

        if (existingUid) {
            return res.status(409).send({
                message: "College UID is already in use at this institution",
                errorType: "DUPLICATE_UID"
            });
        }

        // Verify institution exists
        const institution = await prisma.institutions.findUnique({
            where: { institution_id: coordinatorData.institution_id }
        });

        if (!institution) {
            return res.status(404).send({
                message: "Institution not found",
                errorType: "INVALID_INSTITUTION"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newcoordinator = await prisma.users.create({
            data: {
                college_uid: coordinatorData.college_uid,
                password_hash: hashedPassword,
                email: coordinatorData.email,
                role: "coordinator",
                first_name: coordinatorData.firstName,
                last_name: coordinatorData.lastName,
                institution_id: coordinatorData.institution_id,
            },
        });

        const departments = await getDepartments(); // Use the utility function

        res.status(201).send({
            message: "Coordinator created successfully",
            coordinator: {
                email: newcoordinator.email,
                firstName: newcoordinator.first_name,
                lastName: newcoordinator.last_name,
                collegeUid: newcoordinator.college_uid
            }
        });
    } catch (error) {
        console.error("Error in createcoordinator:", error);

        if (error.code === 'P2002') {
            return res.status(409).send({
                message: "A unique constraint violation occurred",
                errorType: "DATABASE_CONSTRAINT_ERROR",
                field: error.meta?.target?.[0]
            });
        }

        res.status(500).send({
            message: "An unexpected error occurred while creating the coordinator",
            errorType: "SERVER_ERROR",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const listOfCoordinators = async (req, res) => {
    try {
        // Extract pagination and filter parameters from the request query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Optional filtering parameters
        const filters = {
            role: 'coordinator',
            institution_id: parseInt(req.query.institution_id), // Optional: filter by institution
            // Add more filter options as needed
        };

        // Remove undefined filter values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        // Fetch coordinators with pagination and filtering
        const coordinators = await prisma.users.findMany({
            where: filters,
            select: {
               
                college_uid: true,
                email: true,
                first_name: true,
                last_name: true,
                institution_id: true,
                created_at: true
            },
            skip: skip,
            take: limit,
            orderBy: {
                created_at: 'desc' // Most recent coordinators first
            }
        });

        // Count total number of coordinators for pagination metadata
        const totalCoordinators = await prisma.users.count({
            where: filters
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalCoordinators / limit);

        const departments = await getDepartments(); // Use the utility function

        // Prepare response
        res.status(200).json({
            message: 'Coordinators retrieved successfully',
            data: coordinators,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCoordinators: totalCoordinators,
                limit: limit
            }
        });

    } catch (error) {
        console.error('Error in listCoordinators:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};



export { registerInstitution, adminLogin, coordinatorcreate,listOfCoordinators };
