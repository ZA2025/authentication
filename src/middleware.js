
import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

import {
  PUBLIC_ROUTES, 
  LOGIN, 
  ROOT, 
  PROTECTED_SUB_ROUTES, 
  ADMIN_ROUTES
} from "@/lib/routes";

export async function middleware(request) {
  const { nextUrl } = request;
  const session = await auth();
 
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === "admin";
   

  const isPublicRoute = ((PUBLIC_ROUTES.find(route => nextUrl.pathname.startsWith(route))
  || nextUrl.pathname === ROOT) && !PROTECTED_SUB_ROUTES.find(route => nextUrl.pathname.includes(route)));
  //change 
  const isProtectedRoute = !isPublicRoute;

  const isAdminRoute = ADMIN_ROUTES.some(route => nextUrl.pathname.startsWith(route));


  if (!isAuthenticated && !isPublicRoute)
    return Response.redirect(new URL(LOGIN, nextUrl));
  

  // 🚨 Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && isProtectedRoute)
    return Response.redirect(new URL(LOGIN, nextUrl));

  
}

// export const config = {
//   matcher: 
//     ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  
// };
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/api/admin/:path*"
  ],
};