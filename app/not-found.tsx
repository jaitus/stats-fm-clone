import { Music2, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="text-lg text-muted-foreground">
          This page doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  )
}
