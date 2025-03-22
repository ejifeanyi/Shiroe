// middleware.js
import { NextResponse } from "next/server";

interface ProtectedRequest {
    cookies: {
        get(name: string): { value: string } | undefined;
    };
    nextUrl: {
        pathname: string;
    };
    url: string;
}

export function middleware(request: ProtectedRequest): NextResponse {
    // Get token from localStorage (only works client-side)
    // For server-side protection, we'll use cookies instead
    const token = request.cookies.get("token")?.value;

    // Paths that require authentication
    const protectedPaths: string[] = ["/dashboard"];

    // Check if the path is protected
    const isProtectedPath = protectedPaths.some((path: string) =>
        request.nextUrl.pathname.startsWith(path)
    );

    // If it's a protected path and there's no token, redirect to login
    if (isProtectedPath && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
	matcher: ["/dashboard/:path*"],
};
