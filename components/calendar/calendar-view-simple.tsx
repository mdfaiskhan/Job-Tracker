"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay, isValid } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Clock } from "lucide-react"

type CalendarEvent = {
  id: string
  date: Date
  type: "application" | "follow-up"
  title: string
  details: string
  relatedId: string
}

export function CalendarView() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase, user } = useSupabase()

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch applications
        const { data: applications } = await supabase
          .from("applications")
          .select("id, company, role, applied_date")
          .eq("user_id", user.id)

        // Fetch follow-ups
        const { data: followUps } = await supabase
          .from("follow_ups")
          .select("id, job_id, follow_up_date, type, applications(company, role)")
          .eq("user_id", user.id)
          .eq("is_completed", false)

        const applicationEvents: CalendarEvent[] = (applications || [])
          .map((app) => {
            const appDate = new Date(app.applied_date)
            if (!isValid(appDate)) return null

            return {
              id: `app-${app.id}`,
              date: appDate,
              type: "application",
              title: app.company,
              details: app.role,
              relatedId: app.id,
            }
          })
          .filter(Boolean) as CalendarEvent[]

        const followUpEvents: CalendarEvent[] = (followUps || [])
          .map((followUp) => {
            const followUpDate = new Date(followUp.follow_up_date)
            if (!isValid(followUpDate)) return null

            return {
              id: `followup-${followUp.id}`,
              date: followUpDate,
              type: "follow-up",
              title: followUp.applications?.company || "Unknown Company",
              details: `${followUp.type} Follow-up: ${followUp.applications?.role || "Unknown Role"}`,
              relatedId: followUp.job_id,
            }
          })
          .filter(Boolean) as CalendarEvent[]

        setEvents([...applicationEvents, ...followUpEvents])
      } catch (error) {
        console.error("Error fetching calendar events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [supabase, user])

  const selectedDateEvents = events.filter(
    (event) => isValid(event.date) && isValid(date) && isSameDay(event.date, date),
  )

  // Function to check if a day has events
  const dayHasEvents = (day: Date) => {
    return events.some((event) => isValid(event.date) && isSameDay(event.date, day))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="day">Day View</TabsTrigger>
        </TabsList>
        <TabsContent value="month" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border"
                  modifiersClassNames={{
                    selected: "bg-primary text-primary-foreground",
                    today: "bg-accent text-accent-foreground",
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events for {isValid(date) ? format(date, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
              <CardDescription>Applications and follow-ups scheduled for this date</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No events scheduled for this date</p>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 border rounded-lg p-3">
                      <div className="mt-0.5">
                        {event.type === "application" ? (
                          <Briefcase className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isValid(event.date) ? format(event.date, "h:mm a") : "Unknown time"} ·{" "}
                          {event.type === "application" ? "Application" : "Follow-up"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/applications/${event.relatedId}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="day">
          <Card>
            <CardHeader>
              <CardTitle>Day View: {isValid(date) ? format(date, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
              <CardDescription>Detailed view of your schedule for the day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No events scheduled for this date</p>
                  <Button className="mt-4" asChild>
                    <Link href="/applications/new">Add New Application</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedDateEvents.some((event) => event.type === "application") && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                        Applications
                      </h3>
                      <div className="space-y-3 pl-6">
                        {selectedDateEvents
                          .filter((event) => event.type === "application")
                          .map((event) => (
                            <div key={event.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground">{event.details}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/applications/${event.relatedId}`}>View</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {selectedDateEvents.some((event) => event.type === "follow-up") && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                        Follow-ups
                      </h3>
                      <div className="space-y-3 pl-6">
                        {selectedDateEvents
                          .filter((event) => event.type === "follow-up")
                          .map((event) => (
                            <div key={event.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground">{event.details}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/applications/${event.relatedId}`}>View</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
