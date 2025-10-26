import { NextResponse } from 'next/server';
import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (req) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await connectToDatabase();
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${verificationToken}`;
        
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: [email],
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Email Address</h2>
                    <p>Hello ${user.name},</p>
                    <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
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
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">
                        This email was sent from ${process.env.NEXTAUTH_URL}
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ 
                error: 'Failed to send verification email' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Verification email sent' 
        }, { status: 200 });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json({ 
            error: 'Failed to send verification email' 
        }, { status: 500 });
    }
};