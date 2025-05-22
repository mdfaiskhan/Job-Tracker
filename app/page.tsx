import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Bell, Briefcase, CheckCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  let session = null

  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error("Error checking session:", error)
    // Continue with session as null if there's an error
  }

  // Handle redirect outside the try/catch block
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-6 w-6" />
          <span>JobTrackr</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your Job Applications with Ease
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Stay organized, never miss follow-ups, and increase your chances of landing your dream job.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-background">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Track Progress</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Set daily targets and monitor your application progress
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-background">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Smart Reminders</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Never miss a follow-up with automated reminders
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-background">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Application Tracker</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Organize applications by status and priority
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-background">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Timeline View</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      See your complete application history at a glance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 JobTrackr. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
