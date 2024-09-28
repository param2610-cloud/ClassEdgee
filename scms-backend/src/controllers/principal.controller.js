import { principalModel } from "../models/principalprofile.schema.js";
import { generateTokens } from "../utils/generate.js";
import bcrypt from "bcrypt";

const principallogin = async (req, res) => {
    try {
        const { userid, password } = req.body;

        // Input validation
        if (!userid || !password) {
            return res.status(400).json({
                message: "User ID and password are required"
            });
        }

        // Find user by userid only
        const user = await principalModel.findOne({ userid:userid });

        if (!user) {
            // Use a generic message to prevent user enumeration
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            userid,
            '15m',  
            '7d'   
        );
        const UpdatedUser = await principalModel.findOneAndUpdate({ userid:userid }, { refreshToken:refreshToken }, { new: true });
        // Set HTTP-only cookies
        res.cookie("refreshToken", refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict'
        });
        
        res.cookie("accessToken", accessToken, {    
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict'
        });

        // Send response
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                userid: user.userid,
                // Include other non-sensitive user data here
            },
            refreshToken,
            accessToken
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
}


  



export { principallogin }