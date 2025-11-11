// import { auth } from '@/auth';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    //_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        //required: true,
        required: function () { return this.authType !== 'oauth'; } 
    },
    authType: {
        type: String,
        enum: ['local', 'oauth'],
        default: 'local',
    },
    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Add email verification fields
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        default: null,
    },
    emailVerificationExpiry: {
        type: Date,
        default: null,
    },
    resetToken: {
        type: String,
        required: false,
    },
    resetTokenExpiry: {
        type: Date,
        required: false,
    },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;