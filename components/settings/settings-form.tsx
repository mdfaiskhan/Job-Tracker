"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

type UserSettings = {
  first_follow_up_days: number
  second_follow_up_days: number
  final_follow_up_days: number
  email_notifications: boolean
  daily_reminder: boolean
}

export function SettingsForm() {
  const [settings, setSettings] = useState<UserSettings>({
    first_follow_up_days: 7,
    second_follow_up_days: 12,
    final_follow_up_days: 15,
    email_notifications: true,
    daily_reminder: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return

      setIsFetching(true)
      try {
        const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

        if (data) {
          setSettings({
            first_follow_up_days: data.first_follow_up_days,
            second_follow_up_days: data.second_follow_up_days,
            final_follow_up_days: data.final_follow_up_days,
            email_notifications: data.email_notifications,
            daily_reminder: data.daily_reminder,
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [supabase, user])

  const handleSaveSettings = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (existingSettings) {
        await supabase
          .from("user_settings")
          .update({
            first_follow_up_days: settings.first_follow_up_days,
            second_follow_up_days: settings.second_follow_up_days,
            final_follow_up_days: settings.final_follow_up_days,
            email_notifications: settings.email_notifications,
            daily_reminder: settings.daily_reminder,
          })
          .eq("user_id", user.id)
      } else {
        await supabase.from("user_settings").insert([
          {
            user_id: user.id,
            first_follow_up_days: settings.first_follow_up_days,
            second_follow_up_days: settings.second_follow_up_days,
            final_follow_up_days: settings.final_follow_up_days,
            email_notifications: settings.email_notifications,
            daily_reminder: settings.daily_reminder,
          },
        ])
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="follow-ups">
      <TabsList>
        <TabsTrigger value="follow-ups">Follow-up Settings</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="follow-ups">
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Intervals</CardTitle>
            <CardDescription>Customize when follow-ups should be scheduled after applying</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFetching ? (
              <div className="flex justify-center py-4">
                <p>Loading settings...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first-follow-up">First Follow-up (days after applying)</Label>
                  <Input
                    id="first-follow-up"
                    type="number"
                    min={1}
                    max={30}
                    value={settings.first_follow_up_days}
                    onChange={(e) =>
                      setSettings({ ...settings, first_follow_up_days: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="second-follow-up">Second Follow-up (days after applying)</Label>
                  <Input
                    id="second-follow-up"
                    type="number"
                    min={1}
                    max={30}
                    value={settings.second_follow_up_days}
                    onChange={(e) =>
                      setSettings({ ...settings, second_follow_up_days: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="final-follow-up">Final Follow-up (days after applying)</Label>
                  <Input
                    id="final-follow-up"
                    type="number"
                    min={1}
                    max={30}
                    value={settings.final_follow_up_days}
                    onChange={(e) =>
                      setSettings({ ...settings, final_follow_up_days: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isLoading || isFetching}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFetching ? (
              <div className="flex justify-center py-4">
                <p>Loading settings...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for follow-ups and reminders
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-reminder">Daily Check-in Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily reminder to check your application status
                    </p>
                  </div>
                  <Switch
                    id="daily-reminder"
                    checked={settings.daily_reminder}
                    onCheckedChange={(checked) => setSettings({ ...settings, daily_reminder: checked })}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isLoading || isFetching}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled />
              <p className="text-sm text-muted-foreground">Your account email address</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Change Password</Button>
            <Button variant="destructive">Delete Account</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
