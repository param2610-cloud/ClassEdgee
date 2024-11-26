import {
    
    generateTokens
} from "../utils/generate.js";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const registerInstitution = async (req, res) => {
    try {
        const { admin_college_uid, admin_password,admin_email,admin_role="admin",admin_firstname,admin_lastname,admin_profile_picture,admin_phone_number,institution_name,institution_code,institution_address,institution_email,institution_phone_number,institution_license_type="premium" } = req.body;
        if (!admin_college_uid || !admin_password || !admin_email  || !admin_firstname || !admin_lastname || !admin_profile_picture || !admin_phone_number || !institution_name || !institution_code || !institution_address || !institution_email || !institution_phone_number || !institution_license_type) {
            return res.status(400).send({
                message: "All fields are required",
            });
        }
        const hashedPassword = await bcrypt.hash(admin_password, 10);

        const newInstitution = await prisma.institutions.create({
            data:{
                name: institution_name,
                code: institution_code,
                address: institution_address,
                email: institution_email,
                phone_number: institution_phone_number,
                license_type: institution_license_type,
            }
        })
        const newAdminUser =await prisma.users.create({
            data:{
                college_uid: admin_college_uid,
                password_hash: hashedPassword,
                email: admin_email,
                role: admin_role?admin_role:"admin",
                first_name: admin_firstname,
                last_name: admin_lastname,
                profile_picture:admin_profile_picture,
                phone_number: admin_phone_number,
                institution_id: newInstitution.institution_id
            }
        })

        res.status(200).send({
            message: "Institution and Instituition's admin created successfully",
            newAdminUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send( error);
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
                    institutions:true
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

        // Send response
        return res.status(200).send({
            message: "User logged in successfully",
            user: {
                email: finduser.email,
                firstName: finduser.first_name,
                lastName: finduser.last_name,
                institutionId: finduser.institution_id,
                finduser
                // Include other non-sensitive user data here
            },
            refreshToken,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ message: "An error occurred during login" });
    }
};
const coordinatorcreate = async (req, res) => {
    try {
        const { password, ...coordinatorData } = req.body;

        // Validate password strength
        if (password && password.length < 8) {
            return res
                .status(400)
                .send({
                    message: "Password must be at least 8 characters long",
                });
        }

        // Check if college_uid or email already exists
        const existingcoordinator = await prisma.users.findUnique(
            {
                where: {
                    email: coordinatorData.email,
                    college_uid: coordinatorData.college_uid,
                    institution_id: coordinatorData.institution_id,
                },
            }
        );
        if (existingcoordinator) {
            return res
                .status(409)
                .send({ message: "college_uid or email already exists" });
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

        
        res.status(201).send({
            message: "coordinator created successfully",
            newcoordinator,
        });
    } catch (error) {
        console.error("Error in createcoordinator:", error);

        // Generic error handler
        res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export { registerInstitution, adminLogin, coordinatorcreate };
