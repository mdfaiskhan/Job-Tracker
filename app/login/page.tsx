import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Briefcase } from "lucide-react"

export default async function LoginPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
          <Briefcase className="h-6 w-6" />
          <span>JobTrackr</span>
        </Link>
        <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-sm text-muted-foreground">Enter your email below to login to your account</p>
          </div>
          <LoginForm />
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
