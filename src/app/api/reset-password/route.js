import { NextResponse } from 'next/server';
import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';
import bcrypt from 'bcrypt';

export const POST = async (req) => {
    try {
        const { email, password, token } = await req.json();

        // Create a DB Connection
        await connectToDatabase();
        
        const existingUser = await User.findOne({ email });
        

        if (!existingUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 5);
        existingUser.password = hashedPassword;
        
        existingUser.resetToken = undefined;
        existingUser.resetTokenExpiry = undefined;
        await existingUser.save();
        return new NextResponse({ message: 'User\'s password updated' }, { status: 200 });

        //return NextResponse.json({ message: 'User\'s password updated' }, { status: 200 });
        
    } catch (error) {
        console.error('Error generating password reset link:', error);
        return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
    }
};