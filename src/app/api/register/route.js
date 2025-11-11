import { NextResponse } from 'next/server';
import { createUser } from '@/queries/users';
import User from '@/model/user-model';
import { getClientIP, rateLimit } from '@/lib/rateLimiter';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/mongodb';
import crypto from 'crypto';

// Add password validation function at the top of the file
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
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
        
        // Rate limiting: 10 registrations per hour
        const rateLimitResult = rateLimit(`register:${clientIP}`, 10, 60 * 60 * 1000);
        
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
        
        const { name, email, password } = await req.json();

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format.' }, { status:400 });
        }

        // Strong password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
        }
        
        // To do: Create a DB Conection
        await connectToDatabase();
        
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 });
        }

        // Encrypt the password with strong hashing
        const hashedPassword = await bcrypt.hash(password, 12);

        // To do: Form a DB payload
        const newUser = {
            name,
            email,
            password: hashedPassword,
        };
        

        // To do: Update the DB - changes here
        try {
            await createUser(newUser);
            
            // Send email verification email
            if (process.env.RESEND_API_KEY) {
                try {
                    const { Resend } = await import('resend');
                    const resend = new Resend(process.env.RESEND_API_KEY);
                     
                    // Generate verification token
                    const verificationToken = crypto.randomBytes(32).toString('hex');
                    
                    // Update user with verification token
                    await User.findOneAndUpdate(
                        { email },
                        { 
                            emailVerificationToken: verificationToken,
                            emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
                        },
                        { new: true }
                    );
                    
                    // Send verification email
                    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${verificationToken}`;
                    
                    await resend.emails.send({
                        from: process.env.RESEND_FROM_EMAIL,
                        to: [email],
                        subject: 'Verify Your Email Address',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #333;">Welcome ${name}!</h2>
                                <p>Thank you for registering with us. Please verify your email address to complete your registration:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${verificationUrl}" 
                                       style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                        Verify Email
                                    </a>
                                </div>
                                <p>Or copy and paste this link in your browser:</p>
                                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                                <p style="color: #666; font-size: 14px;">
                                    This link will expire in 24 hours. If you didn't create an account, please ignore this email.
                                </p>
                            </div>
                        `,
                    });
                    console.log('Verification email sent successfully');
                } catch (emailError) {
                    console.error('Verification email error:', emailError);
                    // Don't fail registration if email fails
                }
            }
        } catch (error) {
            return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
        }
         
        return NextResponse.json({ message: 'User registered successfully. Please check your email to verify your account.' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
    }
}; 