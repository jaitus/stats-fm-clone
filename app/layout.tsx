import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "stats.fm Clone — Your Spotify Listening Stats",
  description:
    "Deep analytics for your Spotify history — top artists, tracks, listening patterns, genre breakdowns, mood analysis, and a shareable personality card.",
  keywords: [
    "spotify stats",
    "listening history",
    "music analytics",
    "stats.fm",
    "spotify wrapped",
    "top artists",
    "top tracks",
  ],
  icons: {
    icon: [
      { url: "/favicon-32x32.png" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "stats.fm Clone — Your Spotify Listening Stats",
    description:
      "Deep analytics for your Spotify history — top artists, tracks, listening patterns, and a shareable personality card.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(20, 20, 30, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  )
}
