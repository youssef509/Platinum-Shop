import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

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

            if (trigger === "update") {
                session.user.name = token.name;
                
            }
            return session
        },
    }
} satisfies NextAuthConfig;


export const { handlers, auth, signIn, signOut } = NextAuth(config);

