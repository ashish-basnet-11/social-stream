import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, "Code must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});