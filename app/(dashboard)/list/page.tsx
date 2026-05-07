import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ApplicationsTable } from '@/components/list/ApplicationsTable'

export default async function ListPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { applications: { orderBy: { createdAt: 'desc' } } },
  })

  const applications = user?.applications ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">All Applications</h1>
        <p className="text-sm text-gray-500">{applications.length} total</p>
      </div>
      <ApplicationsTable initialApplications={applications} />
    </div>
  )
}
