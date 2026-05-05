import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { JobApplication } from '@/types'

export default async function BoardPage() {
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: { applications: { orderBy: { createdAt: 'desc' } } },
  })

  const applications = (user?.applications ?? []) as unknown as JobApplication[]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Board</h1>
        <p className="text-sm text-gray-500">{applications.length} applications</p>
      </div>
      <KanbanBoard initialApplications={applications} />
    </div>
  )
}
