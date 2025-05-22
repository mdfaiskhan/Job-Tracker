"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { SupabaseClient, User } from "@supabase/supabase-js"

type SupabaseContext = {
  supabase: SupabaseClient
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (error) {
        console.error("Error getting user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return <Context.Provider value={{ supabase, user }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
