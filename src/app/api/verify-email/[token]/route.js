import { NextResponse } from 'next/server';
import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';

export const GET = async (req, { params }) => {
    try {
        const { token } = await params;

        if (!token) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        await connectToDatabase();
        
        const user = await User.findOne({ 
            emailVerificationToken: token,
            emailVerificationExpiry: { $gt: Date.now() } // Check if token is not expired
        });
        
        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Verify email
        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpiry = null;
        await user.save();

        return NextResponse.json({ 
            message: 'Email verified successfully' 
        }, { status: 200 });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json({ 
            error: 'Failed to verify email' 
        }, { status: 500 });
    }
};