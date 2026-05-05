import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      applications: {
        where: status ? { status: status as any } : undefined,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return Response.json(user?.applications ?? [])
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()

  const application = await prisma.jobApplication.create({
    data: {
      userId: user.id,
      company: body.company,
      role: body.role,
      status: body.status ?? 'APPLIED',
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : null,
      jobUrl: body.jobUrl ?? null,
      salary: body.salary ?? null,
      notes: body.notes ?? null,
    },
  })

  return Response.json(application, { status: 201 })
}
