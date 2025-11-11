'use server'; // Required for server actions
import { auth, signIn, signOut } from '@/auth'; // Import signIn and signOut from auth.js
import { redirect } from 'next/dist/server/api-utils';

// Login action
export async function login(formData) {
    const action = formData.get('action'); // Get action from formData

    // Sign in without redirect, so we can check role first
    await signIn(action, { redirect: false }); 

    // Get the session
    const session = await auth();
    
    if (session?.user?.role === 'admin') {
        redirect('/admin')
    } else {
        redirect('/home')
    }
}

// Logout action
export async function logout() {
    await signOut({ redirectTo: '/' }); // Redirect to homepage after logout
}

export async function doCredentialLogin(formData) {
    try {
        const response = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,  // Prevent full page reload on failure
        });

        return response;
    } catch (error) {
        throw error; // Fix incorrect error handling
    }
}
