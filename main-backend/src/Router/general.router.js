import e from "express";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generate.js";
import { PrismaClient } from "@prisma/client";
import {v2 as cloudinary} from "cloudinary";
const prisma = new PrismaClient();

const router = e.Router();


function validateToken(req, res, next) {
    console.log("hey ");
    
    let token = req.header("Authorization")?.split(" ")[1];
    console.log("token acehy",token);
    
    if (!token) {
        token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(400).json({ message: "Invalid token." });
    }
}


router.get("/validate-token", validateToken,async (req, res) => {
    console.log("this is",req.user);
    
    const data = await prisma.users.findUnique({ where: { email: req.user.email } });
    res.status(200).json({ message: "Token is valid", user: data });
});

router.post("/refresh-token", async (req, res) => {
    try {
        const { refreshToken } = req.body; 
        let incomingRefreshToken = req.cookies.refreshToken || req.headers.authorization?.split(' ')[1]; 

        
        if (!incomingRefreshToken && !refreshToken) {
            return res
                .status(401)
                .json({ message: "Access denied. No token provided." });
        }

        
        if (!incomingRefreshToken) {
            incomingRefreshToken = refreshToken;
        }

        
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        
        const user = await findUserById(decodedToken.username);
        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res
                .status(403)
                .json({ message: "Access denied. Invalid Token." });
        }

        console.log(user);
        
        const tokens = generateTokens(
            user.username, 
            "2d", 
            "7d"   
        );

        const newaccessToken = tokens.accessToken;
        const newrefreshToken = tokens.refreshToken;
        console.log(newaccessToken, newrefreshToken);
        
        
        await updateUser(user.username, { refreshToken: newrefreshToken });

        
        res.cookie("refreshToken", newrefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        
        res.cookie("accessToken", newaccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        
        return res.status(200).json({
            message: "Access Token Refreshed Successfully",
            refreshToken: newrefreshToken,
            accessToken: newaccessToken,
        });
    } catch (error) {
        
        return res.status(403).json({ message: "Invalid refresh token." });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body; 
        let incomingRefreshToken = req.cookies.refreshToken || req.headers.authorization?.split(' ')[1]; 

        if (!incomingRefreshToken && !refreshToken) {
            return res
                .status(401)
                .json({ message: "Access denied. No token provided." });
        }

        if (!incomingRefreshToken) {
            incomingRefreshToken = refreshToken;
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await findUserById(decodedToken.username);
        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res
                .status(403)
                .json({ message: "Access denied. Invalid Token." });
        }

        await updateUser(user.username, { refreshToken: null });

        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token." });
    }
});


router.get("/generate-signature", async (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime()/1000);

        const api_secret = process.env.CLOUDINARY_API_SECRET;
        const signature = cloudinary.utils.api_sign_request({timestamp,use_filename: true}, api_secret);
        res.send(signature);
    } catch (error) {
        consolel.log(error);
        res.status(500).send("Internal Server Error");
    }
})



export default router;
