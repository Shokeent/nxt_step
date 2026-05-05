import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { extractFromEmail } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { emailContent } = await request.json()
  if (!emailContent?.trim()) {
    return Response.json({ error: 'emailContent is required' }, { status: 400 })
  }

  try {
    const parsed = await extractFromEmail(emailContent)
    return Response.json(parsed)
  } catch {
    return Response.json({ error: 'Failed to parse email content' }, { status: 422 })
  }
}
