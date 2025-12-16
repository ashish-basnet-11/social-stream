import express from 'express';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit'; // ADD THIS LINE

// Import routes
import postsRoutes from './routes/postsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import helmet from 'helmet'; // Add at top with other imports

config();
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// ADD RATE LIMITERS HERE (BEFORE YOUR ROUTES)
// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 requests per 15 minutes
    message: "Too many login/register attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiters
app.use("/api/", apiLimiter); // General limit for all API routes
app.use("/api/auth/login", authLimiter); // Stricter limit for login
app.use("/api/auth/register", authLimiter); // Stricter limit for register

// API Routes (KEEP THESE AS THEY WERE)
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Graceful shutdown handlers
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});