import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './db.js';

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                isVerified: true,
                provider: true
            }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await prisma.user.findUnique({
                    where: { email: profile.emails[0].value }
                });

                if (user) {
                    // If user exists but signed up with email/password, link Google account
                    if (user.provider === 'local' && !user.providerId) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                provider: 'google',
                                providerId: profile.id,
                                isVerified: true // Auto-verify Google users
                            }
                        });
                    }
                    return done(null, user);
                }

                // Create new user if doesn't exist
                user = await prisma.user.create({
                    data: {
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        provider: 'google',
                        providerId: profile.id,
                        isVerified: true, // Google users are auto-verified
                        password: null // No password for OAuth users
                    }
                });

                done(null, user);
            } catch (error) {
                console.error('Google OAuth error:', error);
                done(error, null);
            }
        }
    )
);

export default passport;