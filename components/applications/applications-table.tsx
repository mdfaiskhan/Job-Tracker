"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { PlusCircle, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Application = {
  id: string
  company: string
  role: string
  applied_date: string
  status: string
  link: string
  notes: string
}

export function ApplicationsTable() {
  const { supabase, user } = useSupabase()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const query = supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("applied_date", { ascending: false })

        const { data } = await query

        setApplications(data || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [supabase, user])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  const groupedApplications = {
    New: filteredApplications.filter((app) => app.status === "New"),
    "Follow-Up Pending": filteredApplications.filter((app) => app.status === "Follow-Up Pending"),
    "Followed Up": filteredApplications.filter((app) => app.status === "Followed Up"),
    Expired: filteredApplications.filter((app) => app.status === "Expired"),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row w-full gap-2 sm:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Follow-Up Pending">Follow-Up Pending</SelectItem>
              <SelectItem value="Followed Up">Followed Up</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/applications/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="table" className="flex-1 sm:flex-initial">
            Table View
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex-1 sm:flex-initial">
            Kanban View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead className="hidden md:table-cell">Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.company}
                          <div className="md:hidden text-sm text-muted-foreground">{app.role}</div>
                          <div className="md:hidden text-xs text-muted-foreground">
                            {format(new Date(app.applied_date), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{app.role}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(app.applied_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/applications/${app.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="kanban">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(groupedApplications).map(([status, apps]) => (
              <Card key={status} className="overflow-hidden">
                <div className="bg-muted p-4">
                  <h3 className="font-semibold">
                    {status} ({apps.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {apps.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No applications</p>
                  ) : (
                    apps.map((app) => (
                      <Card key={app.id} className="p-3">
                        <div className="space-y-2">
                          <div className="font-medium">{app.company}</div>
                          <div className="text-sm text-muted-foreground">{app.role}</div>
                          <div className="text-xs text-muted-foreground">
                            Applied: {format(new Date(app.applied_date), "MMM d, yyyy")}
                          </div>
                          <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href={`/applications/${app.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
