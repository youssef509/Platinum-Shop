import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

// Extended user type for our app
interface ExtendedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "user" | "admin";
}

export const config = {
    trustHost: true,
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // for 30 days
    }, 
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials: {
                email: {type: 'email'},
                password: {type: 'password'}
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }
                // Find user in database
                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string
                    }
                });

                // Check if the user exists and if the password matches
                if (user && user.password) {
                    const isMatch = compareSync(credentials.password as string, user.password);
                    if (isMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        };
                    }
                }
                // if user or password doesn't match
                return null;
            }
        })
    ],
    callbacks: {
        async session({ session, token, trigger }) {
            session.user.id = token.sub!;
            session.user.role = token.role as "user" | "admin";
            session.user.name = token.name;

            if (trigger === "update") {
                session.user.name = token.name;
            }
            return session
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                const extendedUser = user as ExtendedUser;
                token.id = extendedUser.id;
                token.role = extendedUser.role;
                if (extendedUser.name === "NO_NAME") {
                    token.name = extendedUser.email!.split("@")[0];
                }
                
                // Trigger server-side operations for sign-in/sign-up
                if (trigger === "signIn" || trigger === "signUp") {
                    // We'll handle heavy operations like cart merging and user updates
                    // in the client-side after successful sign-in
                    // This keeps the JWT callback lightweight
                }
            }
            
            // Handle session updates
            if (session?.user.name && trigger === "update") {
                token.name = session.user.name;
            }

            return token;
        },
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

