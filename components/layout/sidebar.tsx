"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  FolderKanban,
  Settings,
  Users,
  CreditCard,
  Bell,
  Building2,
} from "lucide-react"
import { useSession } from "next-auth/react"

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'admin';

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: FolderKanban,
      active: pathname === "/tasks",
    },
    {
      title: "Join Estate",
      href: "/estates",
      icon: Building2,
      active: pathname === "/estates",
      show: !isAdmin && !session?.user?.estate,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      active: pathname === "/notifications",
    },
    {
      title: "Profile",
      href: "/profile",
      icon: Users,
      active: pathname === "/profile",
    },
  ];

  const adminRoutes = [
    {
      title: "Admin",
      href: "/admin",
      icon: Settings,
      active: pathname === "/admin",
    },
    {
      title: "Service Charges",
      href: "/admin/service-charges",
      icon: CreditCard,
      active: pathname === "/admin/service-charges",
    },
  ];

  return (
    <aside className="w-14 lg:w-[240px] border-r h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex flex-col gap-2 p-2">
        {routes.map((route) => {
          if (route.show === false) return null;
          
          return (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                route.active && "bg-muted"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className="h-5 w-5" />
                <span className="hidden lg:inline-block ml-2">{route.title}</span>
              </Link>
            </Button>
          );
        })}

        {isAdmin && (
          <>
            <div className="h-px bg-border my-2" />
            {adminRoutes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "justify-start",
                  route.active && "bg-muted"
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-5 w-5" />
                  <span className="hidden lg:inline-block ml-2">{route.title}</span>
                </Link>
              </Button>
            ))}
          </>
        )}
      </div>
    </aside>
  );
} 