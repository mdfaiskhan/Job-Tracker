"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

type Application = {
  id: string
  company: string
  role: string
  applied_date: string
  status: string
}

export function RecentApplications() {
  const { supabase, user } = useSupabase()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("applied_date", { ascending: false })
          .limit(5)

        setApplications(data || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [supabase, user])

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your most recently submitted job applications</CardDescription>
          </div>
          <Button asChild>
            <Link href="/applications/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No applications yet</p>
            <p className="text-sm text-muted-foreground">
              Start tracking your job applications by adding your first one
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{app.company}</h3>
                  <p className="text-sm text-muted-foreground">
                    {app.role} · Applied {formatDistanceToNow(new Date(app.applied_date), { addSuffix: true })}
                  </p>
                </div>
                <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/applications">View all applications</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
