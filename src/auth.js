import mongoose from "mongoose";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { getClientIP, rateLimit } from '@/lib/rateLimiter';
import User from "@/model/user-model";
import bcrypt from "bcryptjs";

// Connect to MongoDB before authentication
async function connectDB() {
     
    if (mongoose.connection.readyState >= 1) {
        console.log("Already connected to MongoDB");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}

// Call this before using User model
connectDB();

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials, req) {
                if (credentials === null) return null;
                // Rate limiting
                const clientIP = getClientIP(req);
                const rateLimitResult = rateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
                
                if (!rateLimitResult.success) {
                    console.log(`Rate limit exceeded for IP: ${clientIP}`);
                    return null;
                }
                
                try {
                    const user = await User.findOne({
                        email: credentials?.email
                    }).lean();
                     
                    if (user) {
                        // Check if email is verified (only for local auth)
                        if (!user.emailVerified && user.authType === 'local') {
                            console.log(`Email not verified for user: ${user.email}`);
                            return null;
                        }
                        // End of email verification check
                        
                        const isMatch = await bcrypt.compare(
                            credentials.password,
                            user.password
                        );

                        if (isMatch) {
                            // Include _id in the returned user object
                            return { 
                                id: user._id.toString(), 
                                email: user.email, 
                                name: user.name, 
                                role: user.role
                            };
                        } else {
                            // Don't expose specific error details
                            return null;
                        }
                    } else {
                        // Don't expose specific error details
                        return null;
                    }
                } catch (error) {
                    throw new Error(error);
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
            async profile(profile) {
                try {
                    // Ensure the user information is stored in the UserInfo collection
                    await connectDB();
                    let user = await User.findOne({ email: profile.email });

                    if (!user) {
                        user = new User({
                            name: profile.name,
                            email: profile.email,
                            authType: "oauth", 
                        });
                        await user.save({ validateBeforeSave: false });
                    }
                    return { 
                        id: user._id.toString(), 
                        email: user.email, 
                        name: user.name,
                        role: user.role
                    };

                } catch (error) {
                    console.error('Google OAuth error:', error);
                    return null;
                }
                 
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET, // Ensure the NEXTAUTH_SECRET is included here
    callbacks: {
        async session({ session, token, account }) {
            // Include _id in the session
            session.user.id = token.id;
            // Admin role
            session.user.role = token.role;
             
            return session;
        },
        async jwt({ token, user, account }) {
            if (user) {
                // Include _id in the token
                //token.id = user.id;
                token.id = user.id || (account && account.providerAccountId);
                token.role = user.role;
                 
                
            }
            return token;
        },
    },
});