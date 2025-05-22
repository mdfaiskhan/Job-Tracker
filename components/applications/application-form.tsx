"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type ApplicationFormProps = {
  initialData?: {
    id: string
    company: string
    role: string
    link: string
    applied_date: string
    notes: string
  }
}

export function ApplicationForm({ initialData }: ApplicationFormProps = {}) {
  const [company, setCompany] = useState(initialData?.company || "")
  const [role, setRole] = useState(initialData?.role || "")
  const [link, setLink] = useState(initialData?.link || "")
  const [appliedDate, setAppliedDate] = useState<Date>(
    initialData?.applied_date ? new Date(initialData.applied_date) : new Date(),
  )
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [isLoading, setIsLoading] = useState(false)

  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const applicationData = {
        company,
        role,
        link,
        applied_date: appliedDate.toISOString(),
        notes,
        user_id: user.id,
        status: "New",
      }

      if (isEditing) {
        // Update existing application
        await supabase.from("applications").update(applicationData).eq("id", initialData.id)

        toast({
          title: "Application updated",
          description: "Your job application has been updated successfully.",
        })
      } else {
        // Create new application
        const { data, error } = await supabase.from("applications").insert([applicationData]).select()

        if (error) throw error

        // Create timeline entry for application creation
        if (data && data[0]) {
          await supabase.from("timeline_logs").insert([
            {
              job_id: data[0].id,
              action_type: "Application Added",
              timestamp: new Date().toISOString(),
              note: `Applied to ${company} for ${role} position`,
              user_id: user.id,
            },
          ])

          // Schedule follow-ups
          const firstFollowUpDate = new Date(appliedDate)
          firstFollowUpDate.setDate(firstFollowUpDate.getDate() + 7)

          const secondFollowUpDate = new Date(appliedDate)
          secondFollowUpDate.setDate(secondFollowUpDate.getDate() + 12)

          const finalFollowUpDate = new Date(appliedDate)
          finalFollowUpDate.setDate(finalFollowUpDate.getDate() + 15)

          await supabase.from("follow_ups").insert([
            {
              job_id: data[0].id,
              follow_up_date: firstFollowUpDate.toISOString().split("T")[0],
              type: "First",
              is_completed: false,
              user_id: user.id,
            },
            {
              job_id: data[0].id,
              follow_up_date: secondFollowUpDate.toISOString().split("T")[0],
              type: "Second",
              is_completed: false,
              user_id: user.id,
            },
            {
              job_id: data[0].id,
              follow_up_date: finalFollowUpDate.toISOString().split("T")[0],
              type: "Final",
              is_completed: false,
              user_id: user.id,
            },
          ])
        }

        toast({
          title: "Application added",
          description: "Your job application has been added successfully.",
        })
      }

      // Use window.location for a hard redirect
      window.location.href = "/applications"
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating application" : "Error adding application",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Application" : "Add New Application"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Job Link</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/job"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applied-date">Applied Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !appliedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appliedDate ? format(appliedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={appliedDate}
                  onSelect={(date) => date && setAppliedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
                ? "Update Application"
                : "Add Application"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
