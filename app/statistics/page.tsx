import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { StatisticsView } from "@/components/statistics/statistics-view"

export default async function StatisticsPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    redirect("/login")
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">Analyze your job application performance</p>
        </div>
        <StatisticsView />
      </div>
    </AppLayout>
  )
}
