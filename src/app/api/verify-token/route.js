import { NextResponse } from 'next/server';
import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';
import crypto from 'crypto';

export const POST = async (req) => {
    try {
        const { token } = await req.json();

        // Create a DB Connection
        await connectToDatabase();

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const existingUser = await User.findOne({
            resetToken: hashedToken,
            // This is to make sure the token is not expired using the $gt operator
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!existingUser) {
            return new NextResponse({ message: 'Invalid or expired token' }, { status: 400 });
            //return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
        }

        return new NextResponse(JSON.stringify(existingUser), { status: 200 });

         
    } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ message: 'Failed to verify token' }, { status: 500 });
    }
};