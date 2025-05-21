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
                token.id = user.id;
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
                if (trigger === "signIn" || trigger === "signUp") {
                    const cookiesObject = await cookies();
                    const sessionCardId = cookiesObject.get('sessionCardId')?.value;
                    if (sessionCardId) {
                        const sessionCard = await prisma.cart.findFirst({
                            where: { sessionCardId }
                        });
                        if (sessionCard) {
                            await prisma.cart.deleteMany({
                                where: { userId: user.id }
                            });
                            await prisma.cart.update({
                                where: { id: sessionCard.id },
                                data: { userId: user.id, }
                            })
                            // Delete the session cart id cookie
                            cookiesObject.delete('sessionCardId');
                        } 
                    }
                }
            }
            // Handel session updates
            if (session?.user.name && trigger === "update") {
                token.name = session.user.name;
            }
            

            return token;
        },
        authorized( {request, auth}: any ) {
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

            // Check if user is not authenticated
            if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;


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

