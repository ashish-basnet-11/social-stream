import { prisma } from "../config/db.js";
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
}
    from "../validators/authValidators.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import { z } from 'zod';

// Generate 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password } = validatedData;

        // Check if user exists in main User table or PendingUser table
        const userExists = await prisma.user.findUnique({ where: { email } });
        const pendingUserExists = await prisma.pendingUser.findUnique({ where: { email } });

        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        // If pending user exists, we can overwrite it or tell them to check email. 
        // Overwriting is cleaner if they lost the code.
        if (pendingUserExists) {
            await prisma.pendingUser.delete({ where: { email } });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create pending user
        const pendingUser = await prisma.pendingUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                verificationCode,
                verificationExpiry,
            }
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationCode);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Delete pending user if email fails
            await prisma.pendingUser.delete({ where: { id: pendingUser.id } });
            return res.status(500).json({
                error: "Failed to send verification email. Please try again."
            });
        }

        res.status(201).json({
            status: "success",
            message: "Registration successful! Please check your email for verification code.",
            data: {
                email: pendingUser.email,
                requiresVerification: true
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message
                }))
            });
        }

        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: "Email and code are required" });
        }

        // Look for user in PendingUser table
        const pendingUser = await prisma.pendingUser.findUnique({
            where: { email }
        });

        if (!pendingUser) {
            // Check if they are already verified in User table
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already verified" });
            }
            return res.status(404).json({ error: "Registration request not found" });
        }

        // Check if code matches and hasn't expired
        if (pendingUser.verificationCode !== code) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        if (new Date() > pendingUser.verificationExpiry) {
            return res.status(400).json({ error: "Verification code has expired" });
        }

        // Move to main User table
        const user = await prisma.user.create({
            data: {
                name: pendingUser.name,
                email: pendingUser.email,
                password: pendingUser.password, // Already hashed
                isVerified: true,
            }
        });

        // Delete from pending
        await prisma.pendingUser.delete({ where: { id: pendingUser.id } });

        // Generate token and log them in
        const token = generateToken(user.id, res);

        res.status(200).json({
            status: "success",
            message: "Email verified successfully",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isVerified: true
                },
                token
            }
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "Server error during verification" });
    }
};

const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check PendingUser first
        const pendingUser = await prisma.pendingUser.findUnique({
            where: { email }
        });

        if (!pendingUser) {
            // Check if already verified
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                return res.status(400).json({ error: "Email already verified" });
            }
            return res.status(404).json({ error: "Registration not found" });
        }

        // Generate new code
        const verificationCode = generateVerificationCode();
        const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.pendingUser.update({
            where: { id: pendingUser.id },
            data: {
                verificationCode,
                verificationExpiry,
            }
        });

        // Send email
        await sendVerificationEmail(email, verificationCode);

        res.status(200).json({
            status: "success",
            message: "Verification code resent successfully"
        });
    } catch (error) {
        console.error("Resend code error:", error);
        res.status(500).json({ error: "Failed to resend verification code" });
    }
};

const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ error: "Incorrect email or password" });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                error: "Email not verified. Please verify your email first.",
                requiresVerification: true,
                email: user.email
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Incorrect email or password" });
        }

        const token = generateToken(user.id, res);

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified
                },
                token,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message
                }))
            });
        }

        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
};

const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        status: "success",
        message: "Logout successful"
    });
};

// backend/src/controllers/authController.js

const getMe = async (req, res) => {
    try {
        // req.user.id comes from your auth middleware
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                showEmail: true, // This is the missing piece!
                avatar: true,
                bio: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            status: "success",
            data: {
                user: user // Return the fresh user object with all fields
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });

        // For security, don't reveal if a user exists or not
        if (!user) {
            return res.status(200).json({
                status: "success",
                message: "If an account exists with that email, a reset code has been sent."
            });
        }

        const resetCode = generateVerificationCode();
        const resetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: resetCode, // Reusing these fields or create specific ones in Schema
                verificationExpiry: resetExpiry,
            }
        });

        await sendPasswordResetEmail(email, resetCode);

        res.status(200).json({
            status: "success",
            message: "Reset code sent to your email."
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = resetPasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.verificationCode !== code || new Date() > user.verificationExpiry) {
            return res.status(400).json({ error: "Invalid or expired reset code" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verificationCode: null,
                verificationExpiry: null,
            }
        });

        res.status(200).json({
            status: "success",
            message: "Password reset successful! You can now log in."
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export { register, login, logout, getMe, verifyEmail, resendVerificationCode, resetPassword, forgotPassword };