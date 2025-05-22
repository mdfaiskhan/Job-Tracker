import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { ApplicationForm } from "@/components/applications/application-form"

export default async function NewApplicationPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Application</h1>
          <p className="text-muted-foreground">Track a new job application</p>
        </div>
        <ApplicationForm />
      </div>
    </AppLayout>
  )
}
