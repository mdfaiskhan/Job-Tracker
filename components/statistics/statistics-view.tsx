"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfMonth, startOfWeek, eachDayOfInterval } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

type ApplicationStats = {
  totalApplications: number
  totalFollowUps: number
  completedFollowUps: number
  applicationsByStatus: Record<string, number>
  applicationsByDay: Record<string, number>
  applicationsByCompany: Record<string, number>
}

export function StatisticsView() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month")
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplications: 0,
    totalFollowUps: 0,
    completedFollowUps: 0,
    applicationsByStatus: {},
    applicationsByDay: {},
    applicationsByCompany: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const { supabase, user } = useSupabase()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        let startDate: Date | null = null
        const endDate = new Date()

        if (timeRange === "week") {
          startDate = startOfWeek(endDate)
        } else if (timeRange === "month") {
          startDate = startOfMonth(endDate)
        }

        // Fetch applications
        let query = supabase.from("applications").select("*").eq("user_id", user.id)

        if (startDate) {
          query = query.gte("applied_date", startDate.toISOString())
        }

        const { data: applications } = await query

        // Fetch follow-ups
        let followUpsQuery = supabase.from("follow_ups").select("*").eq("user_id", user.id)

        if (startDate) {
          followUpsQuery = followUpsQuery.gte("follow_up_date", startDate.toISOString().split("T")[0])
        }

        const { data: followUps } = await followUpsQuery

        // Process applications by status
        const applicationsByStatus: Record<string, number> = {}
        const applicationsByDay: Record<string, number> = {}
        const applicationsByCompany: Record<string, number> = {}

        // Initialize days for the selected time range
        if (startDate) {
          const days = eachDayOfInterval({ start: startDate, end: endDate })
          days.forEach((day) => {
            const formattedDate = format(day, "yyyy-MM-dd")
            applicationsByDay[formattedDate] = 0
          })
        }

        // Process applications
        applications?.forEach((app) => {
          // By status
          applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1

          // By day
          const appDate = format(new Date(app.applied_date), "yyyy-MM-dd")
          applicationsByDay[appDate] = (applicationsByDay[appDate] || 0) + 1

          // By company
          applicationsByCompany[app.company] = (applicationsByCompany[app.company] || 0) + 1
        })

        setStats({
          totalApplications: applications?.length || 0,
          totalFollowUps: followUps?.length || 0,
          completedFollowUps: followUps?.filter((f) => f.is_completed).length || 0,
          applicationsByStatus,
          applicationsByDay,
          applicationsByCompany,
        })
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase, user, timeRange])

  // Prepare data for charts
  const statusChartData = Object.entries(stats.applicationsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }))

  const dayChartData = Object.entries(stats.applicationsByDay)
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const companyChartData = Object.entries(stats.applicationsByCompany)
    .map(([company, count]) => ({
      name: company,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 companies

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(value: "week" | "month" | "all") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.totalFollowUps}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold">
                {stats.completedFollowUps} (
                {stats.totalFollowUps > 0 ? Math.round((stats.completedFollowUps / stats.totalFollowUps) * 100) : 0}
                %)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications Over Time</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="companies">Top Companies</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications Over Time</CardTitle>
              <CardDescription>Number of applications submitted by date</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : dayChartData.length === 0 ? (
                <div className="flex justify-center py-8 text-center">
                  <p className="text-muted-foreground">No application data available for the selected time range</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), "MMM d")}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [value, "Applications"]}
                        labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
                      />
                      <Bar dataKey="count" fill="#8884d8" name="Applications" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>Breakdown of applications by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : statusChartData.length === 0 ? (
                <div className="flex justify-center py-8 text-center">
                  <p className="text-muted-foreground">No status data available for the selected time range</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} applications`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Top Companies Applied To</CardTitle>
              <CardDescription>Companies with the most applications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : companyChartData.length === 0 ? (
                <div className="flex justify-center py-8 text-center">
                  <p className="text-muted-foreground">No company data available for the selected time range</p>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={companyChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={100}
                        tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
                      />
                      <Tooltip formatter={(value) => [value, "Applications"]} />
                      <Bar dataKey="value" fill="#82ca9d" name="Applications" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
