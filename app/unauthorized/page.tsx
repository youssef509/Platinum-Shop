import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
    title: 'Unauthorized',
    description: 'Unauthorized access page',
}

const Unauthorized = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
            <h1 className="text-3xl font-bold">Unauthorized Access</h1>
            <p>You do not have permission to view this page.</p>
            <Link href="/">
                <Button>Go to Home</Button>
            </Link>
        </div>
    );
}

export default Unauthorized;