import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";
import { Input } from "@/components/ui/input";


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <div className="flex flex-col">
        <div className="border-b container mx-auto">
            <div className="flex items-center h-16 px-4">
                <Link href="/" className="w-22">
                    <Image
                        src="/images/logo.png"
                        width={60}
                        height={60}
                        alt={APP_NAME}
                    />
                </Link>
                {/* Main Nav */}
                <MainNav className="ms-6" />
                <div className="ml-auto items-center flex space-x-4">
                    <div>
                        <Input className="md:w-[100px] lg:w-[300px]" type="search" placeholder="Search..." />
                    </div>
                    <Menu />
                </div>
            </div>
        </div>

        <div className="flex-1 space-y-4 p-8 pt-8 container mx-auto">
            {children}
        </div>
    </div>
    </>
   
  );
}