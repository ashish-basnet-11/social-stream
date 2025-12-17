import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email - Social App',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Verify Your Email</h2>
                <p>Thank you for registering! Please use the following code to verify your email:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #2563eb; letter-spacing: 5px; margin: 0;">${code}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPasswordResetEmail = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - Social App',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Reset Your Password</h2>
                <p>You requested to reset your password. Use the following code:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #2563eb; letter-spacing: 5px; margin: 0;">${code}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send password reset email');
    }
};