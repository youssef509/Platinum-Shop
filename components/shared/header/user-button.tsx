import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

const UserButton = async () => {
    const session = await auth();
    if (!session) {
        return <Button asChild variant="default">
            <Link href='/sign-in'>
               <UserIcon />  Sign In
            </Link>
        </Button>
    }

    const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? 'U';

    
    return <div className="flex gap-2 items-center">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center">
                    <Button variant="ghost" className="relativee w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200">
                        {firstInitial}
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium leading-none">
                            {session.user?.name}
                        </div>
                        <div className="text-sm font-muted-foreground leading-none">
                            {session.user?.email}
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0 mb-1">
                    <Button variant="destructive" className="w-full" onClick={signOutUser}>
                        Sign Out
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>;
}
 
export default UserButton;