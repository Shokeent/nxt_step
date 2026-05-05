'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ParsedEmail } from '@/types'

interface EmailParseDialogProps {
  onParsed: (data: Partial<{
    company: string
    role: string
    appliedDate: string
    jobUrl: string
    notes: string
  }>) => void
}

export function EmailParseDialog({ onParsed }: EmailParseDialogProps) {
  const [open, setOpen] = useState(false)
  const [emailContent, setEmailContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleParse() {
    if (!emailContent.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/parse-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContent }),
      })
      if (!res.ok) throw new Error('Failed to parse')
      const parsed: ParsedEmail = await res.json()
      onParsed({
        company: parsed.company ?? undefined,
        role: parsed.role ?? undefined,
        appliedDate: parsed.appliedDate ?? undefined,
        jobUrl: parsed.jobUrl ?? undefined,
        notes: parsed.notes ?? undefined,
      })
      setOpen(false)
      setEmailContent('')
    } catch {
      setError('Could not parse the email. Try again or fill in manually.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Parse from email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Parse Email with AI</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Paste a job application confirmation email and Claude will extract the details for you.
          </p>
          <div className="space-y-1">
            <Label htmlFor="email-content">Email content</Label>
            <Textarea
              id="email-content"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste your email here..."
              rows={8}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleParse}
              disabled={loading || !emailContent.trim()}
            >
              {loading ? 'Parsing…' : 'Parse'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
