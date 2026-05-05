import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.jobApplication.findFirst({
    where: { id, user: { email: session.user.email } },
  })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...(body.company !== undefined && { company: body.company }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.appliedDate !== undefined && {
        appliedDate: body.appliedDate ? new Date(body.appliedDate) : null,
      }),
      ...(body.jobUrl !== undefined && { jobUrl: body.jobUrl }),
      ...(body.salary !== undefined && { salary: body.salary }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  })

  return Response.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.jobApplication.findFirst({
    where: { id, user: { email: session.user.email } },
  })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  await prisma.jobApplication.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
