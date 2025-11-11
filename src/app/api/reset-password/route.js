import { NextResponse } from 'next/server';
import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';
import { getClientIP, rateLimit } from '@/lib/rateLimiter';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Add the same password validation function as registration
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
}

export const POST = async (req) => {
    try {
        // ADD RATE LIMITING HERE (right after the try block starts)
        const clientIP = getClientIP(req);
        
        // Rate limiting: 3 reset attempts per hour
        const rateLimitResult = rateLimit(`reset-password:${clientIP}`, 3, 60 * 60 * 1000);
        
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
        
        const { email, password, token } = await req.json();

        // Validate input
        if (!email || !password || !token) {
            return NextResponse.json({ 
                message: 'Email, password, and token are required' 
            }, { status: 400 });
        }

        // Strong password validation (same as registration)
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json({ 
                message: passwordValidation.message 
            }, { status: 400 });
        }

        // Create a DB Connection
        await connectToDatabase();
        
        // Hash the token to match stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const existingUser = await User.findOne({ 
            email,
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() } // Check if token is not expired
        });

        if (!existingUser) {
            return NextResponse.json({ 
                message: 'Invalid or expired reset token' 
            }, { status: 400 });
        }

        // Use strong bcrypt rounds (12 instead of 5)
        const hashedPassword = await bcrypt.hash(password, 12);
        existingUser.password = hashedPassword;
        
        // Clear reset token
        existingUser.resetToken = undefined;
        existingUser.resetTokenExpiry = undefined;
        
        await existingUser.save();
        return NextResponse.json({ 
            message: 'Password updated successfully' 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ 
            message: 'Failed to update password' 
        }, { status: 500 });
    }
};