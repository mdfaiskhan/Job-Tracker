import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { FollowUpsList } from "@/components/follow-ups/follow-ups-list"

export default async function FollowUpsPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">Manage your follow-ups and reminders</p>
        </div>
        <FollowUpsList />
      </div>
    </AppLayout>
  )
}
