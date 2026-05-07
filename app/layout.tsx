import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobTracker',
  description: 'Track your job applications',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
