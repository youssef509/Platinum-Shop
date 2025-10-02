import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// Extended user type for our app
interface ExtendedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "user" | "admin";
}

// Lightweight auth config for middleware - NO HEAVY DEPENDENCIES
export const lightweightConfig = {
    trustHost: true,
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            credentials: {
                email: { type: 'email' },
                password: { type: 'password' }
            },
            // This authorize function won't be used in middleware
            // It's just here to satisfy TypeScript requirements
            async authorize() {
                throw new Error("authorize should not be called in middleware");
            }
        })
    ],
    callbacks: {
        // Lightweight JWT callback - no database operations
        async jwt({ token, user }) {
            if (user) {
                const extendedUser = user as ExtendedUser;
                token.id = extendedUser.id;
                token.role = extendedUser.role;
                if (extendedUser.name === "NO_NAME") {
                    token.name = extendedUser.email!.split("@")[0];
                }
            }
            return token;
        },
        // Lightweight session callback
        async session({ session, token }) {
            session.user.id = token.sub!;
            session.user.role = token.role as "user" | "admin";
            session.user.name = token.name;
            return session;
        },
        // Lightweight authorized callback for routing and session cart
        authorized({ request, auth }) {
            // Array of regex patterns of the paths we want to protect
            const protectedPaths = [
                /\/shipping-address/,
                /\/payment-method/,
                /\/place-order/,
                /\/profile/,
                /\/user\/(.*)/,
                /\/admin\/(.*)/,
                /\/order\/(.*)/,
            ];

            // Get the current path from the request URL object
            const { pathname } = request.nextUrl;

            // Check if user is not authenticated and trying to access protected routes
            if (!auth && protectedPaths.some((p) => p.test(pathname))) {
                return false;
            }

            // Handle session cart cookie
            if (!request.cookies.get('sessionCardId')) {
                // Generate a new session cart id
                const sessionCardId = crypto.randomUUID();
                
                // Create new response with session cart cookie
                const response = NextResponse.next({
                    request: {
                        headers: new Headers(request.headers),
                    },
                });
                
                // Set newly generated session cart id in the response cookies
                response.cookies.set('sessionCardId', sessionCardId);
                return response;
            }

            return true;
        }
    },
} satisfies NextAuthConfig;

export const { auth: lightweightAuth } = NextAuth(lightweightConfig);