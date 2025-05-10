'use client';
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";


const NotFoundPage = () => {
    return <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
            src='/images/logo.png'
            alt={`${APP_NAME} Logo`}
            width={100}
            height={100}
            priority={true}
        />
        <div className="p-6 w-1/3 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-destructive">Could not find requested page</p>
            <Button className="mt-4 ml-2" variant="outline" onClick={ () => (window.location.href = '/') }>
                Go to Homepage
            </Button>
        </div>
    </div>;
}
 
export default NotFoundPage;