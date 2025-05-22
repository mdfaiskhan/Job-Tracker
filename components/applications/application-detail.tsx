"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import Link from "next/link"
import { ApplicationForm } from "@/components/applications/application-form"
import { ApplicationTimeline } from "@/components/applications/application-timeline"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Edit, ExternalLink, Trash } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  applied_date: string
  status: string
  link: string
  notes: string
}

type FollowUp = {
  id: string
  job_id: string
  follow_up_date: string
  type: string
  is_completed: boolean
}

export function ApplicationDetail({ application }: { application: Application }) {
  const [isEditing, setIsEditing] = useState(false)
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!user) return

      try {
        const { data } = await supabase
          .from("follow_ups")
          .select("*")
          .eq("job_id", application.id)
          .order("follow_up_date", { ascending: true })

        setFollowUps(data || [])
      } catch (error) {
        console.error("Error fetching follow-ups:", error)
      }
    }

    fetchFollowUps()
  }, [supabase, user, application.id])

  const handleDelete = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Delete follow-ups
      await supabase.from("follow_ups").delete().eq("job_id", application.id)

      // Delete timeline logs
      await supabase.from("timeline_logs").delete().eq("job_id", application.id)

      // Delete application
      await supabase.from("applications").delete().eq("id", application.id)

      toast({
        title: "Application deleted",
        description: "The job application has been deleted successfully.",
      })

      // Use window.location for a hard redirect
      window.location.href = "/applications"
    } catch (error: any) {
      toast({
        title: "Error deleting application",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkFollowUp = async (followUpId: string) => {
    if (!user) return

    try {
      // Update follow-up status
      await supabase.from("follow_ups").update({ is_completed: true }).eq("id", followUpId)

      // Update application status
      await supabase.from("applications").update({ status: "Followed Up" }).eq("id", application.id)

      // Add timeline entry
      await supabase.from("timeline_logs").insert([
        {
          job_id: application.id,
          action_type: "Follow-Up Completed",
          timestamp: new Date().toISOString(),
          note: `Completed follow-up for ${application.company}`,
          user_id: user.id,
        },
      ])

      toast({
        title: "Follow-up marked as completed",
        description: "The follow-up has been marked as completed.",
      })

      // Refresh follow-ups
      const { data } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("job_id", application.id)
        .order("follow_up_date", { ascending: true })

      setFollowUps(data || [])

      // Refresh the page
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error updating follow-up",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500"
      case "Follow-Up Pending":
        return "bg-yellow-500"
      case "Followed Up":
        return "bg-green-500"
      case "Expired":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Application</h1>
          <p className="text-muted-foreground">Update your job application details</p>
        </div>
        <ApplicationForm
          initialData={{
            id: application.id,
            company: application.company,
            role: application.role,
            link: application.link,
            applied_date: application.applied_date,
            notes: application.notes,
          }}
        />
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel Editing
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{application.company}</h1>
          <p className="text-muted-foreground">{application.role}</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this job application and all associated data. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="flex-1 sm:flex-initial">
            Details
          </TabsTrigger>
          <TabsTrigger value="follow-ups" className="flex-1 sm:flex-initial">
            Follow-ups
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1 sm:flex-initial">
            Timeline
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Details about your job application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                  <p className="mt-1">{application.company}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                  <p className="mt-1">{application.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Applied Date</h3>
                  <p className="mt-1">{format(new Date(application.applied_date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                  </div>
                </div>
                {application.link && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Job Link</h3>
                    <p className="mt-1 break-all">
                      <a
                        href={application.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:underline"
                      >
                        {application.link}
                        <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                      </a>
                    </p>
                  </div>
                )}
                {application.notes && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="mt-1 whitespace-pre-line">{application.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/applications">Back to Applications</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="follow-ups">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Schedule</CardTitle>
              <CardDescription>Scheduled follow-ups for this application</CardDescription>
            </CardHeader>
            <CardContent>
              {followUps.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No follow-ups scheduled</p>
              ) : (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{followUp.type} Follow-up</span>
                          {followUp.is_completed && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(followUp.follow_up_date), "MMMM d, yyyy")}
                        </p>
                      </div>
                      {!followUp.is_completed && (
                        <Button size="sm" className="mt-2 sm:mt-0" onClick={() => handleMarkFollowUp(followUp.id)}>
                          Mark as Done
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <ApplicationTimeline applicationId={application.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
