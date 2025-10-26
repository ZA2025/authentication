import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';
import crypto from 'crypto';
import { Resend } from 'resend'; // <-- Added
import { NextResponse } from 'next/server';
import { getClientIP, rateLimit } from '@/lib/rateLimiter';

const resend = new Resend(process.env.RESEND_API_KEY); // <-- Added

export const POST = async (req) => {
    // ADD RATE LIMITING HERE (right after the try block starts)
    const clientIP = getClientIP(req);
    
    // Rate limiting: 5 reset requests per hour
    const rateLimitResult = rateLimit(`forgot-password:${clientIP}`, 5, 60 * 60 * 1000);
    
    if (!rateLimitResult.success) {
        return NextResponse.json({ 
            error: rateLimitResult.message 
        }, { 
            status: 429,
            headers: {
                'Retry-After': rateLimitResult.retryAfter
            }
        });
    }
    
    const { email } = await req.json();

    // Create a DB Connection
    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        return NextResponse.json({ message: 'Email does not exist' }, { status: 400 });
    }

    if (existingUser.authType === 'oauth') {
        return NextResponse.json({ message: 'Google users cannot reset passwords. Please use Google login.' }, { status: 403 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = Date.now() + 3600000; // 1 hour

    existingUser.resetToken = passwordResetToken;
    existingUser.resetTokenExpiry = passwordResetExpires;

    // Save the updated user
    await existingUser.save({ validateBeforeSave: false });

    // Generate the reset URL
    const resetUrl = `http://${req.headers.get('host')}/reset-password/${resetToken}`;

    // --- CHANGED: Prepare Resend email ---
    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL, // <-- must be a verified domain or sandbox
            to: [email],
            subject: 'Password Reset Request',
            html: `
                <p>Hello ${existingUser.name || ''},</p>
                <p>You have requested a password reset. Click the link below to reset your password:</p>
                <p><a href="${resetUrl}">Click here to reset your password</a></p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });

        return NextResponse.json({ message: 'If an account with that email exists, we’ve sent a password reset link.', resetUrl, email }, { status: 200 });
    } catch (error) {
        console.error('Resend error:', error);

        // Clear the reset token if email fails
        existingUser.resetToken = undefined;
        existingUser.resetTokenExpiry = undefined;
        await existingUser.save({ validateBeforeSave: false });

        return NextResponse.json({ message: 'Failed to send email' }, { status: 400 });
    }
};
