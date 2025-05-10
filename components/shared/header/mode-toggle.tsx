'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, SunMoon } from "lucide-react";


const ModeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null;
    }
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='focus-visible:ring-0 focus-visible:ring-offset-0'>
                {theme === 'system' ? (
                    <SunMoon />
                ) : theme === 'dark' ? (
                    <MoonIcon />
                ) : (
                    <SunIcon />
                )}
                
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
           <DropdownMenuLabel>Appearance</DropdownMenuLabel>
           <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={ theme === 'system' } onCheckedChange={() => setTheme('system')}>
                    System
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={ theme === 'dark' } onCheckedChange={() => setTheme('dark')}>
                    Dark
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={ theme === 'light' } onCheckedChange={() => setTheme('light')}>
                    Light
                </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
    </DropdownMenu>;
}
 
export default ModeToggle;