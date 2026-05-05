import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { emailContent } = await request.json()
  if (!emailContent?.trim()) {
    return Response.json({ error: 'emailContent is required' }, { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Extract job application data from this email. Return ONLY valid JSON with these exact fields:
- company (string): company name
- role (string): job title/position
- appliedDate (string or null): date in YYYY-MM-DD format, or null
- jobUrl (string or null): job posting URL, or null
- notes (string or null): 1-2 sentence summary, or null

Email:
${emailContent}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? text)
    return Response.json(parsed)
  } catch {
    return Response.json({ error: 'Failed to parse email content' }, { status: 422 })
  }
}
