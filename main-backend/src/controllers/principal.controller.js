import { transporter } from "../config/transporter.js";
import { principalModel } from "../models/principalprofile.schema.js";
import { generateTokens } from "../utils/generate.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const principallogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Input validation
        if (!username || !password) {
            return res.status(400).json({
                message: "username and password are required",
            });
        }

        // Find user by username only
        const user = await principalModel.findOne({ username: username });

        if (!user) {
            // Use a generic message to prevent user enumeration
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(
            username,
            "15m",
            "7d"
        );
        const UpdatedUser = await principalModel.findOneAndUpdate(
            { username: username },
            { refreshToken: refreshToken },
            { new: true }
        );
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

        // Send response
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                username: user.username,
                role: user.role,
                // Include other non-sensitive user data here
            },
            refreshToken,
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
};
const principalAuthdataEmailSent = async (req, res) => {
    const { uid, email, username, password } = req.body;

    if (!uid || !email || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const mailOptions = {
        from: `"ClassEdgee Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to ClassEdgee - Your Principal Account Information",
        text: `
  Dear ${username},
  
  Welcome to ClassEdgee! Your principal account has been successfully created.
  
  Here are your login credentials:
  
  Username: ${username}
  Password: ${password}
  
  For security reasons, please change your password upon your first login.
  
  To access the LMS, please visit: https://ClassEdgeesystem.com/login
  
  If you need any assistance or have questions, please don't hesitate to contact our support team at support@ClassEdgeesystem.com.
  
  Best regards,
  The ClassEdgee Team
        `,
        html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ClassEdgee</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
              <td align="center" style="padding: 20px 0;">
                  <img src="https://ClassEdgeesystem.com/logo.png" alt="ClassEdgee Logo" width="150" style="max-width: 100%; height: auto;">
              </td>
          </tr>
      </table>
      <h1 style="color: #4a4a4a; text-align: center;">Welcome to ClassEdgee!</h1>
      <p>Dear ${username},</p>
      <p>Your principal account has been successfully created in our Learning Management System. We're excited to have you on board!</p>
      <h2 style="color: #4a4a4a;">Your Login Credentials</h2>
      <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
          <tr>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>Username:</strong></td>
              <td style="border: 1px solid #ddd; padding: 10px;">${username}</td>
          </tr>
          <tr>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>Password:</strong></td>
              <td style="border: 1px solid #ddd; padding: 10px;">${password}</td>
          </tr>
      </table>
      <p><strong>Important:</strong> For security reasons, please change your password upon your first login.</p>
      <p style="text-align: center;">
          <a href="https://ClassEdgeesystem.com/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Access ClassEdgee</a>
      </p>
      <p>If you need any assistance or have questions, please don't hesitate to contact our support team at <a href="mailto:support@ClassEdgeesystem.com">support@ClassEdgeesystem.com</a>.</p>
      <p>Best regards,<br>The ClassEdgee Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #777; text-align: center;">
          This is an automated message. Please do not reply to this email. If you didn't request this account, please contact us immediately.
      </p>
  </body>
  </html>
        `,
        headers: {
            "X-Priority": "3",
            "X-MSMail-Priority": "Normal",
            Importance: "Normal",
            "X-Mailer": "ClassEdgee Mailer",
            "List-Unsubscribe":
                "<mailto:unsubscribe@ClassEdgeesystem.com?subject=Unsubscribe>",
        },
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            message: "Authentication email sent successfully",
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};

const listOfPrincipals = async (req, res) => {
    try {
        const principals = await principalModel.find();
        res.status(200).json(principals);
    } catch (error) {
        console.error("Error retrieving principals:", error);
        res.status(500).json({ error: "Failed to retrieve principals" });
    }
};


export { principallogin, principalAuthdataEmailSent,listOfPrincipals };
