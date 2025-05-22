import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { ApplicationsTable } from "@/components/applications/applications-table"

export default async function ApplicationsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Manage and track all your job applications</p>
        </div>
        <ApplicationsTable />
      </div>
    </AppLayout>
  )
}
