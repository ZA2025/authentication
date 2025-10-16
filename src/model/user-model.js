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
    // --- Add this block below ---
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // --- End of new block ---
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