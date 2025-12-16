import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

// Protect routes - requires authentication
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ 
                error: "Not authorized, please login" 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        req.user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { 
                id: true, 
                email: true, 
                name: true 
            }
        });
        
        if (!req.user) {
            return res.status(401).json({ 
                error: "User not found" 
            });
        }
        
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ 
            error: "Not authorized, invalid token" 
        });
    }
};

// Optional authentication - doesn't block if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { 
                    id: true, 
                    email: true, 
                    name: true 
                }
            });
        }
        
        next();
    } catch (error) {
        // Don't block request, just continue without user
        next();
    }
};