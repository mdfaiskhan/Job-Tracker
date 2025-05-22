import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { CalendarView } from "@/components/calendar/calendar-view-simple"

export default async function CalendarPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    redirect("/login")
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View your applications and follow-ups on a calendar</p>
        </div>
        <CalendarView />
      </div>
    </AppLayout>
  )
}
