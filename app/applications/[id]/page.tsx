import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { ApplicationDetail } from "@/components/applications/application-detail"

export default async function ApplicationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: application } = await supabase.from("applications").select("*").eq("id", params.id).single()

  if (!application) {
    notFound()
  }

  return (
    <AppLayout>
      <ApplicationDetail application={application} />
    </AppLayout>
  )
}
