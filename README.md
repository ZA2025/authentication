# NextJs Authentication App

A modern authentication and user management system built with Next.js.  
Supports registration, login, password reset, and social authentication (Google).  
Includes protected routes, user profile management, and a sample product listing.

---

## Features

- User registration and login (credentials & Google OAuth)
- Password reset and email verification flows
- Protected routes (dashboard, profile, etc.)
- Product listing and details pages
- Responsive UI with modern design
- MongoDB integration for user and product data
- Modular, scalable code structure

---

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [NextAuth.js](https://next-auth.js.org/) (authentication)
- [MongoDB](https://www.mongodb.com/) (database)
- [Sass](https://sass-lang.com/) (styling)
- [Vercel](https://vercel.com/) (deployment, optional)

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm, yarn, or pnpm
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   - Copy the example environment file and fill in your own values:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and provide the required values for each variable.
   - The `.env.example` file documents all required environment variables for this project.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
  app/                # Next.js app directory (routes, pages, layouts)
    api/              # API routes (auth, user, products, etc.)
    components/       # Reusable React components
    data/             # Static data (products, users)
    lib/              # Utility libraries (DB connection, routes)
    model/            # Mongoose models (User, UserInfo)
    queries/          # Database queries
    styles/           # Global and modular styles (Sass)
    middleware.js     # Next.js middleware (auth, etc.)
```

---

## Usage

- **Register:** Create a new account with email and password.
- **Login:** Sign in with credentials or Google.
- **Profile:** View and update your user profile.
- **Products:** Browse product listings and details.
- **Password Reset:** Request a password reset email and set a new password.

---

## Authentication

- **Credentials:** Email & password (stored securely, hashed).
- **Google OAuth:** Sign in with your Google account.
- **Session Management:** Secure, HTTP-only cookies.

---

## Environment Variables

All required environment variables are documented in the `.env.example` file. Copy this file to `.env.local` and fill in your own values before running the project.

```
MONGODB_URI=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SENDGRID_FROM_EMAIL=
SENDGRID_API_KEY=
NEXTAUTH_URL=
```

---

## Testing

_Coming soon!_  
(You can add tests with Jest and React Testing Library.)

---

 