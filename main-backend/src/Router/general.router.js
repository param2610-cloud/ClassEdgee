import e from "express";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generate.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = e.Router();


function validateToken(req, res, next) {
    let token = req.header("Authorization")?.split(" ")[1];
    
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
    const data = await prisma.users.findUnique({ where: { college_uid: req.user.college_uid } });
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
            "15m", 
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




export default router;
