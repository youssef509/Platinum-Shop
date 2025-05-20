import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // for 30 days
        //     30days*24hours*60min*60sec                  
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
                // if user or password dosn't match
                return null;
            }
        })
    ],
    callbacks: {
         async session({ session, user, trigger, token, }: any) {

            session.user.id = token.sub;
            session.user.role = token.role;
            session.user.name = token.name;

            if (trigger === "update") {
                session.user.name = token.name;
            }
            return session
        },
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.role = user.role;
                if (user.name === "NO_NAME") {
                    token.name = user.email!.split("@")[0];
                }
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        name: token.name,
                    }
                });
            }
            return token;
        },
        authorized( {request, auth}: any ) {
            // Check for session cart cookie
            if (!request.cookies.get('sessionCardId')) {
                // Generate a new session cart id
                const sessionCardId = crypto.randomUUID();
                
                // Clone the request headers
                const newRequestHeaders = new Headers(request.headers);

                // Create new response and  add the new headers
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders,
                    },
                });
                // Set newly generated session cart id in the response cookies
                response.cookies.set('sessionCardId', sessionCardId );
                return response;
            } else {
                return true;
            }
        }
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

