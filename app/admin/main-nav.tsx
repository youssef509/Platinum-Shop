'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react"; 


const links = [
    { href: "/admin/overview", label: "Overview" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/users", label: "Users" },
];

const MainNav = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const pathname = usePathname();
    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
            {links.map((link) => (
                <Link key={link.href} href={link.href}
                    className={cn("text-sm font-medium transition-colors hover:text-primary", pathname.includes(link.href) ? "" : "text-muted-foreground")}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
 
export default MainNav;