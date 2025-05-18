import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./sign-up-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
    title: "Sign Up"
}


const SignUpPage = async (props: {
     searchParams: Promise<{
        callbackUrl: string;
     }>
}) => {
    const { callbackUrl } = await props.searchParams;

    const session = await auth()
    if (session) {
        redirect(callbackUrl ||'/')
    }

    return <div className="w-full max-w-md mx-auto">
        <Card>
            <CardHeader className="space-y-4">
                <Link href='/' className="flex-center">
                    <Image
                    src='/images/logo.png'
                    width={100}
                    height={100}
                    alt={`${APP_NAME} logo`}
                    priority={true}
                    />
                </Link>
                <CardTitle className="text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                    Enter your details to create an account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SignUpForm />
            </CardContent>
        </Card>
    </div>;
}
 
export default SignUpPage;