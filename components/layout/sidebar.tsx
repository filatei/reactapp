"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Inbox,
  MoreHorizontal,
  FolderKanban,
  Plus,
  Settings,
  Users,
  CreditCard,
  Bell,
} from "lucide-react"
import { useSession } from "next-auth/react"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: FolderKanban,
  },
  {
    title: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: Users,
  },
]

const adminNavItems = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Service Charges",
    href: "/admin/service-charges",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/tasks/new" className="w-full">
          <Button variant="ghost" className="w-full justify-start cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "transparent"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
        
        {session?.user?.role === 'admin' && (
          <>
            <div className="my-4 h-px bg-border" />
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Admin
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </div>
  )
} 