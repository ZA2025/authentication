import { NextResponse } from 'next/server';
import { createUser } from '@/queries/users';
import User from '@/model/user-model';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/mongodb';

export const POST = async (req) => {
    try {
        const { name, email, password } = await req.json();

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format.' }, { status:400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status:400 });
        }
        // To do: Create a DB Conection
        await connectToDatabase();
        
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 });
        }

        // To do: Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 5);

        // To do: Form a DB payload
        const newUser = {
            name,
            email,
            password: hashedPassword,
        };

        // To do: Update the DB
        try {
            await createUser(newUser);
            // Todo: If
        } catch (error) {
            
            return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
        }
         
        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
    }
};