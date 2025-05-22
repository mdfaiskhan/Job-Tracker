"use client"

import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, LogOut, Menu, Moon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/app-sidebar"

export function AppHeader() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      // Use window.location for a hard redirect
      window.location.href = "/"
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-[300px] sm:w-[300px] pr-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 font-bold text-xl p-4 border-b">
                <Briefcase className="h-5 w-5" />
                <span>JobTrackr</span>
              </div>
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Briefcase className="h-5 w-5" />
          <span>JobTrackr</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoading ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
