// backend/src/routes/oauthRoutes.js
import express from 'express';
import passport from 'passport';
import { googleCallback, getOAuthUser, checkAuth } from '../controllers/oauthController.js';

const router = express.Router();

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
        session: true
    }),
    googleCallback
);

// Get current OAuth user
router.get('/oauth/user', getOAuthUser);

// Check authentication status
router.get('/check', checkAuth);

export default router;