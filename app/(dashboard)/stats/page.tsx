import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { ApplicationStatus } from '@/types'
import { STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/types'
import { cn } from '@/lib/utils'

export default async function StatsPage() {
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: { applications: true },
  })

  const applications = user?.applications ?? []
  const total = applications.length

  const countByStatus = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: applications.filter((a) => a.status === s).length }),
    {} as Record<ApplicationStatus, number>
  )

  const responded = applications.filter(
    (a) => !['WISHLIST', 'APPLIED'].includes(a.status)
  ).length

  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0
  const offerRate = total > 0 ? Math.round((countByStatus.OFFER / total) * 100) : 0

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">Stats</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} />
        <StatCard label="Response Rate" value={`${responseRate}%`} />
        <StatCard label="Interviews" value={countByStatus.INTERVIEW} />
        <StatCard label="Offers" value={countByStatus.OFFER} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Applications by Stage</h2>
        <div className="space-y-3">
          {STATUSES.map((status) => {
            const count = countByStatus[status]
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-600 shrink-0">{STATUS_LABELS[status]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={cn('h-2.5 rounded-full', {
                      'bg-slate-400': status === 'WISHLIST',
                      'bg-blue-500': status === 'APPLIED',
                      'bg-yellow-400': status === 'PHONE_SCREEN',
                      'bg-purple-500': status === 'INTERVIEW',
                      'bg-green-500': status === 'OFFER',
                      'bg-red-400': status === 'REJECTED',
                    })}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-gray-500 text-right shrink-0">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
