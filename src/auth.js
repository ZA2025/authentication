import mongoose from "mongoose";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import User from "@/model/user-model";
import UserInfo from "@/model/userInfo-model";
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
            async authorize(credentials) {
                if (credentials === null) return null;
                
                try {
                    const user = await User.findOne({
                        email: credentials?.email
                    }).lean();
                     
                    if (user) {
                        const isMatch = await bcrypt.compare(
                            credentials.password,
                            user.password
                        );

                        if (isMatch) {
                            // Include _id in the returned user object
                           
                            return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
                        } else {
                            throw new Error("Email or Password is not correct");
                        }
                    } else {
                        throw new Error("User not found");
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
                // Ensure the user information is stored in the UserInfo collection
                await connectDB();
                let user = await User.findOne({ email: profile.email });

                if (!user) {
                    user = new User({
                        name: profile.name,
                        email: profile.email,
                        authType: "oauth", // ✅ Mark as OAuth user
                        //password: undefined, // No password for OAuth users
                    });
                    await user.save({ validateBeforeSave: false });
                }
                //const userInfo = await UserInfo.findOne({ userId: user._id });
                //if (!userInfo) {
                //    const newUserInfo = new UserInfo({
                //        userId: user._id,
                //        name: profile.name,
                //    });
                //    await newUserInfo.save();
                //}


                return { 
                    id: user._id.toString(), 
                    email: user.email, 
                    name: user.name,
                    role: user.role
                };
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