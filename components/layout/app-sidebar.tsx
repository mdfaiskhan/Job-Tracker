"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Briefcase, Calendar, Clock, Home, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  return (
    <aside className="hidden border-r bg-background md:block md:w-64 shrink-0">
      <SidebarContent />
    </aside>
  )
}

export function SidebarContent() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Applications",
      href: "/applications",
      icon: Briefcase,
    },
    {
      title: "Follow-ups",
      href: "/follow-ups",
      icon: Clock,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Statistics",
      href: "/statistics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "secondary" : "ghost"}
            className="justify-start"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-5 w-5" />
              {item.title}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  )
}
