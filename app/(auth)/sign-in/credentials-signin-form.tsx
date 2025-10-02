'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { signInDefaultValues } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";
import { handlePostSignIn } from "@/lib/post-auth-utils";

const CredentialsSignInForm = () => {
    const [data, action] = useActionState(signInWithCredentials, {
        success: false, 
        message: ''
    });

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    // Handle post-authentication operations when sign-in is successful
    useEffect(() => {
        if (data?.success) {
            handlePostSignIn().catch(console.error);
        }
    }, [data?.success]);

    const SignInButton = () => {
        const { pending } = useFormStatus();

        return (
            <Button disabled={pending} className="w-full" variant="default">
                { pending ? 'Signing in...' : 'Sign In'}
            </Button>
        )
    }
    
    return <form action={action}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-6">
            <div>
                <Label>Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    defaultValue={signInDefaultValues.email}
                />
            </div>
            <div>
                <Label>Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="password"
                    defaultValue={signInDefaultValues.password}
                />
            </div>
            <div>
                <SignInButton />
            </div>
            { data && !data.success && (
                <div className="text-center text-destructive">{data.message}</div>
            )}
            <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account? { '' }
                <Link href='/sign-up' target="_self" className="link">
                    Sign Up
                </Link>
            </div>
        </div>
    </form>;
}
 
export default CredentialsSignInForm;