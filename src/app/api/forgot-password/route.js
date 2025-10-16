
import User from '@/model/user-model';
import connectToDatabase from '@/lib/mongodb';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';
 

export const POST = async (req) => {
    const { email } = await req.json();

        // Create a DB Connection
        await connectToDatabase();

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return new NextResponse.json({ message: 'Eamil does not exists' }, { status: 400 });
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
        //await existingUser.save();

        // Generate the reset URL
        const resetUrl = `http://${req.headers.get('host')}/reset-password/${resetToken}`;

        const body = `
            <p>You have requested a password reset</p>
            <p>Click <a href="${resetUrl}">here</a> to reset your password</p>
        `;
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Password Reset Request',
            html: body,
        };

        sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
        sgMail
            .send(msg)
            .then(() => {
                return NextResponse.json({ message: 'Password reset link generated', resetUrl, email }, { status: 200 });
            })
            .catch(async (error) => {
                existingUser.resetToken = undefined;
                existingUser.resetTokenExpiry = undefined;
                await existingUser.save();
                return NextResponse.json({ message: 'Failed to send email' }, { status: 400 })
            });

        try {
            await existingUser.save({ validateBeforeSave: false });
            return NextResponse.json({ message: 'Password reset link generated', resetUrl, email }, { status: 200 });
        } catch (error) {
            console.error('Error saving user:', error);
            return NextResponse.json({ message: 'Failed to generate reset link' }, { status: 500 });
        }

};