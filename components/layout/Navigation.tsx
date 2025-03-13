"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="border-b">
            <div className="flex h-16 items-center px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <Button variant={isActive("/") ? "default" : "ghost"}>
                            Home
                        </Button>
                    </Link>
                    <Link href="/tasks">
                        <Button variant={isActive("/tasks") ? "default" : "ghost"}>
                            Tasks
                        </Button>
                    </Link>
                    {session?.user?.role === "admin" && (
                        <Link href="/admin/service-charges">
                            <Button variant={isActive("/admin/service-charges") ? "default" : "ghost"}>
                                Service Charges
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    {session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                {session.user.role === "admin" && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/users" className="flex items-center">
                                            <Users className="mr-2 h-4 w-4" />
                                            Manage Users
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="flex items-center text-red-600"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/auth/signin">
                            <Button>Sign In</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
} 