"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { format, isToday, isPast, addDays } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, CheckCircle } from "lucide-react"

type FollowUp = {
  id: string
  job_id: string
  follow_up_date: string
  type: string
  is_completed: boolean
  application: {
    id: string
    company: string
    role: string
  }
}

export function FollowUpsList() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data } = await supabase
          .from("follow_ups")
          .select(`
            *,
            application:applications(id, company, role)
          `)
          .eq("user_id", user.id)
          .order("follow_up_date", { ascending: true })

        setFollowUps(data || [])
      } catch (error) {
        console.error("Error fetching follow-ups:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowUps()
  }, [supabase, user])

  const handleMarkComplete = async (followUpId: string, applicationId: string) => {
    if (!user) return

    try {
      // Update follow-up status
      await supabase.from("follow_ups").update({ is_completed: true }).eq("id", followUpId)

      // Update application status
      await supabase.from("applications").update({ status: "Followed Up" }).eq("id", applicationId)

      // Add timeline entry
      const { data: application } = await supabase
        .from("applications")
        .select("company, role")
        .eq("id", applicationId)
        .single()

      if (application) {
        await supabase.from("timeline_logs").insert([
          {
            job_id: applicationId,
            action_type: "Follow-Up Completed",
            timestamp: new Date().toISOString(),
            note: `Completed follow-up for ${application.company}`,
            user_id: user.id,
          },
        ])
      }

      toast({
        title: "Follow-up marked as completed",
        description: "The follow-up has been marked as completed.",
      })

      // Refresh follow-ups
      const { data } = await supabase
        .from("follow_ups")
        .select(`
          *,
          application:applications(id, company, role)
        `)
        .eq("user_id", user.id)
        .order("follow_up_date", { ascending: true })

      setFollowUps(data || [])

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating follow-up",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const todayFollowUps = followUps.filter(
    (followUp) => isToday(new Date(followUp.follow_up_date)) && !followUp.is_completed,
  )

  const upcomingFollowUps = followUps.filter(
    (followUp) =>
      !isToday(new Date(followUp.follow_up_date)) &&
      !isPast(new Date(followUp.follow_up_date)) &&
      !followUp.is_completed,
  )

  const pastFollowUps = followUps.filter(
    (followUp) =>
      isPast(addDays(new Date(followUp.follow_up_date), 1)) &&
      !isToday(new Date(followUp.follow_up_date)) &&
      !followUp.is_completed,
  )

  const completedFollowUps = followUps.filter((followUp) => followUp.is_completed)

  const renderFollowUpList = (followUpList: FollowUp[]) => {
    if (followUpList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No follow-ups in this category</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {followUpList.map((followUp) => (
          <Card key={followUp.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{followUp.application?.company}</h3>
                    <span className="text-sm text-muted-foreground">{followUp.type} Follow-up</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{followUp.application?.role}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(followUp.follow_up_date), "MMMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!followUp.is_completed && (
                    <Button size="sm" onClick={() => handleMarkComplete(followUp.id, followUp.application?.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/applications/${followUp.application?.id}`}>View Application</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="today">
      <TabsList>
        <TabsTrigger value="today">Today ({todayFollowUps.length})</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming ({upcomingFollowUps.length})</TabsTrigger>
        <TabsTrigger value="past">Past Due ({pastFollowUps.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedFollowUps.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <Card>
          <CardHeader>
            <CardTitle>Today's Follow-ups</CardTitle>
            <CardDescription>Follow-ups that are due today</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading follow-ups...</p>
              </div>
            ) : (
              renderFollowUpList(todayFollowUps)
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Follow-ups</CardTitle>
            <CardDescription>Follow-ups that are coming up in the future</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading follow-ups...</p>
              </div>
            ) : (
              renderFollowUpList(upcomingFollowUps)
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="past">
        <Card>
          <CardHeader>
            <CardTitle>Past Due Follow-ups</CardTitle>
            <CardDescription>Follow-ups that are overdue</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading follow-ups...</p>
              </div>
            ) : (
              renderFollowUpList(pastFollowUps)
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="completed">
        <Card>
          <CardHeader>
            <CardTitle>Completed Follow-ups</CardTitle>
            <CardDescription>Follow-ups that have been completed</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading follow-ups...</p>
              </div>
            ) : (
              renderFollowUpList(completedFollowUps)
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
