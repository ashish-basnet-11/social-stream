import { prisma } from "../config/db.js";
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js"; // Add this import

const register = async (req, res) => {
    try {
        // Validate input with Zod
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password } = validatedData;

        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const token = generateToken(user.id, res);

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token,
            }
        })
    } catch (error) {
        // Handle Zod validation errors
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
}

const login = async (req, res) => {
    try {
        // Validate input with Zod
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        // Check if the user email exists
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(400).json({ error: "Incorrect email or password" })
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Incorrect email or password" })
        }

        const token = generateToken(user.id, res);

        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    email: user.email
                },
                token,
            }
        })
    } catch (error) {
        // Handle Zod validation errors
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
}

const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    })
    res.status(200).json({
        status: "success",
        message: "Logout successful"
    })
}

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            data: { 
                user: req.user // Already set by protect middleware
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};

// Update export
export { register, login, logout, getMe };