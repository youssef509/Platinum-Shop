import { DefaultSession } from "next-auth";

declare module "next-auth" {
    export interface Session {
        user: {
            role: 'user' | 'admin';
        } & DefaultSession["user"];
    }
}
