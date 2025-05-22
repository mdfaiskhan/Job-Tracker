"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { CheckCircle, Clock, FileText, Plus } from "lucide-react"

type TimelineEvent = {
  id: string
  job_id: string
  action_type: string
  timestamp: string
  note: string
}

export function ApplicationTimeline({ applicationId }: { applicationId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase } = useSupabase()

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true)
      try {
        const { data } = await supabase
          .from("timeline_logs")
          .select("*")
          .eq("job_id", applicationId)
          .order("timestamp", { ascending: false })

        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching timeline:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeline()
  }, [supabase, applicationId])

  const getEventIcon = (actionType: string) => {
    switch (actionType) {
      case "Application Added":
        return <Plus className="h-5 w-5" />
      case "Follow-Up Completed":
        return <CheckCircle className="h-5 w-5" />
      case "Status Updated":
        return <Clock className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Timeline</CardTitle>
        <CardDescription>History of actions for this application</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No timeline events yet</p>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:left-5 before:ml-0.5 before:border-l-2 before:border-l-muted">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getEventIcon(event.action_type)}
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-semibold">{event.action_type}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(event.timestamp), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                  {event.note && <div className="mt-2 text-sm">{event.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
