"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { Progress } from "@/components/ui/progress"
import { Briefcase, Clock, Target, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type StatsData = {
  todaySubmitted: number
  followUpsDue: number
  expired: number
  active: number
  dailyTarget: number
}

export function DashboardStats() {
  const { supabase, user } = useSupabase()
  const [stats, setStats] = useState<StatsData>({
    todaySubmitted: 0,
    followUpsDue: 0,
    expired: 0,
    active: 0,
    dailyTarget: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const today = new Date().toISOString().split("T")[0]

        // Get today's applications
        const { data: todayApps } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .gte("applied_date", today)
          .lt("applied_date", new Date(new Date(today).getTime() + 86400000).toISOString())

        // Get follow-ups due today
        const { data: followUps } = await supabase
          .from("follow_ups")
          .select("*")
          .eq("is_completed", false)
          .eq("follow_up_date", today)
          .eq("user_id", user.id)

        // Get expired applications
        const { data: expiredApps } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "Expired")

        // Get active applications
        const { data: activeApps } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .neq("status", "Expired")

        // Get today's target
        const { data: targetData } = await supabase
          .from("user_targets")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .single()

        setStats({
          todaySubmitted: todayApps?.length || 0,
          followUpsDue: followUps?.length || 0,
          expired: expiredApps?.length || 0,
          active: activeApps?.length || 0,
          dailyTarget: targetData?.target_number || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase, user])

  const progressPercentage =
    stats.dailyTarget > 0 ? Math.min(Math.round((stats.todaySubmitted / stats.dailyTarget) * 100), 100) : 0

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Today's Applications</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.todaySubmitted}</div>
          )}
          {stats.dailyTarget > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-2 w-full" />
              ) : (
                <Progress value={progressPercentage} className="h-2" />
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Target: {stats.todaySubmitted} of {stats.dailyTarget} applications
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.followUpsDue}</div>
          )}
          <p className="text-xs text-muted-foreground">Pending follow-ups for today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Expired Applications</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats.expired}</div>}
          <p className="text-xs text-muted-foreground">Applications with no response</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats.active}</div>}
          <p className="text-xs text-muted-foreground">Total applications in progress</p>
        </CardContent>
      </Card>
    </div>
  )
}
