import { Metadata } from "next";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import ProfileForm from "./profile-form";


export const metadata: Metadata = {
    title: 'User Profile',
    description: 'Manage your profile information',
}

const Profile = async () => {
    const session = await auth();
    return (
        <SessionProvider session={session}>
            <div className="max-w-md mx-auto space-y-4 ">
                <h2 className="h2-bold">Profile</h2>
                <ProfileForm />
            </div>
        </SessionProvider>
    );
}

export default Profile;
