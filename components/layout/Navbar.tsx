import { auth, signOut } from '@/auth'
import Link from 'next/link'
import { LayoutDashboard, List, BarChart2, LogOut } from 'lucide-react'

export async function Navbar() {
  const session = await auth()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-gray-900">
              JobTracker
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
                <LayoutDashboard className="h-4 w-4" />
                Board
              </Link>
              <Link href="/list" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
                <List className="h-4 w-4" />
                List
              </Link>
              <Link href="/stats" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
                <BarChart2 className="h-4 w-4" />
                Stats
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                className="h-7 w-7 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button type="submit" className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
