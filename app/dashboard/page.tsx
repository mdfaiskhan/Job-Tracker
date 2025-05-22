import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { DailyTargetPrompt } from "@/components/dashboard/daily-target-prompt"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentApplications } from "@/components/dashboard/recent-applications"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    redirect("/login")
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your job applications and follow-ups</p>
        </div>
        <DailyTargetPrompt />
        <DashboardStats />
        <RecentApplications />
      </div>
    </AppLayout>
  )
}
