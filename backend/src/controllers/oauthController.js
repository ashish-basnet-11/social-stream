// backend/src/controllers/oauthController.js
import generateToken from "../utils/generateToken.js";

// Google OAuth callback handler
export const googleCallback = (req, res) => {
    try {
        // req.user is set by passport after successful authentication
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // Generate JWT token
        const token = generateToken(req.user.id, res);

        // Redirect to frontend with success
        res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

// Get current OAuth user
export const getOAuthUser = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    isVerified: req.user.isVerified,
                    provider: req.user.provider
                }
            }
        });
    } catch (error) {
        console.error('Get OAuth user error:', error);
        res.status(500).json({ error: "Failed to get user" });
    }
};

// Check authentication status
export const checkAuth = (req, res) => {
    res.status(200).json({
        authenticated: req.isAuthenticated(),
        user: req.user || null
    });
};