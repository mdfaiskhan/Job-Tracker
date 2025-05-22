import type React from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 w-full overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
