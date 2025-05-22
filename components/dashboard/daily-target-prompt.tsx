"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"

export function DailyTargetPrompt() {
  const [target, setTarget] = useState<number>(3)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [hasExistingTarget, setHasExistingTarget] = useState(false)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    const checkExistingTarget = async () => {
      if (!user) return

      try {
        const today = new Date().toISOString().split("T")[0]
        const { data: existingTarget } = await supabase
          .from("user_targets")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .single()

        if (existingTarget) {
          setTarget(existingTarget.target_number)
          setHasExistingTarget(true)
        }
      } catch (error) {
        console.error("Error checking existing target:", error)
      }
    }

    checkExistingTarget()
  }, [supabase, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if a target already exists for today
      const { data: existingTarget } = await supabase
        .from("user_targets")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (existingTarget) {
        // Update existing target
        await supabase.from("user_targets").update({ target_number: target }).eq("user_id", user.id).eq("date", today)
      } else {
        // Insert new target
        await supabase.from("user_targets").insert([{ user_id: user.id, date: today, target_number: target }])
      }

      toast({
        title: "Target set",
        description: `Your daily target of ${target} applications has been set.`,
      })

      setIsVisible(false)
      setHasExistingTarget(true)
    } catch (error: any) {
      toast({
        title: "Error setting target",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible && hasExistingTarget) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Daily Target</CardTitle>
        <CardDescription>How many job applications do you want to submit today?</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={1}
              max={20}
              value={target}
              onChange={(e) => setTarget(Number.parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span>applications</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" type="button" onClick={() => setIsVisible(false)}>
            Skip
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Setting target..." : hasExistingTarget ? "Update Target" : "Set Target"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
