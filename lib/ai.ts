import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function extractFromEmail(emailContent: string): Promise<{
  company: string | null
  role: string | null
  appliedDate: string | null
  jobUrl: string | null
  notes: string | null
}> {
  const message = await client.messages.create({
    model: process.env.AI_MODEL ?? 'claude-sonnet-4-6',
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
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch?.[0] ?? text)
}
