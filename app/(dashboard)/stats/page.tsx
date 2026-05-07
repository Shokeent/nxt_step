import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { ApplicationStatus } from '@/types'
import { STATUSES, STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'

export default async function StatsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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

  // Last 6 months of activity
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleString('default', { month: 'short' })
    const count = applications.filter((a) => {
      const date = new Date(a.appliedDate ?? a.createdAt)
      return date.getFullYear() === d.getFullYear() && date.getMonth() === d.getMonth()
    }).length
    return { label, count }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Stats</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} />
        <StatCard label="Response Rate" value={`${responseRate}%`} />
        <StatCard label="Interviews" value={countByStatus.INTERVIEW} />
        <StatCard label="Offer Rate" value={`${offerRate}%`} sub={`${countByStatus.OFFER} offer${countByStatus.OFFER !== 1 ? 's' : ''}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Monthly Activity</h2>
          <MonthlyChart data={monthlyData} />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Breakdown</h2>
          <div className="space-y-3">
            {STATUSES.map((status) => {
              const count = countByStatus[status]
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600 shrink-0">{STATUS_LABELS[status]}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className={cn('h-2.5 rounded-full transition-all', {
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
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function MonthlyChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const BAR_W = 36
  const GAP = 20
  const CHART_H = 100
  const totalW = data.length * (BAR_W + GAP) - GAP

  return (
    <svg
      viewBox={`-4 0 ${totalW + 8} ${CHART_H + 32}`}
      className="w-full"
      aria-label="Monthly application activity"
    >
      {data.map((d, i) => {
        const barH = Math.max((d.count / max) * CHART_H, d.count > 0 ? 4 : 2)
        const x = i * (BAR_W + GAP)
        const y = CHART_H - barH
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              rx={4}
              className={d.count > 0 ? 'fill-blue-500' : 'fill-gray-100'}
            />
            {d.count > 0 && (
              <text
                x={x + BAR_W / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize={10}
                className="fill-gray-500"
              >
                {d.count}
              </text>
            )}
            <text
              x={x + BAR_W / 2}
              y={CHART_H + 18}
              textAnchor="middle"
              fontSize={10}
              className="fill-gray-400"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
