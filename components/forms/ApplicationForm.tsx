'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmailParseDialog } from './EmailParseDialog'
import type { ApplicationStatus, JobApplication } from '@/types'
import { STATUSES, STATUS_LABELS } from '@/types'

interface ApplicationFormProps {
  defaultStatus?: ApplicationStatus
  onSuccess: (app: JobApplication) => void
  onCancel: () => void
}

export function ApplicationForm({ defaultStatus = 'APPLIED', onSuccess, onCancel }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    company: '',
    role: '',
    status: defaultStatus,
    appliedDate: new Date().toISOString().split('T')[0],
    jobUrl: '',
    salary: '',
    notes: '',
  })

  function handleParsed(data: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...data }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          appliedDate: form.appliedDate || null,
          jobUrl: form.jobUrl || null,
          salary: form.salary || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save application')
      const app = await res.json()
      onSuccess(app)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-end">
        <EmailParseDialog onParsed={handleParsed} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            required
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            required
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ApplicationStatus }))}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="appliedDate">Date Applied</Label>
          <Input
            id="appliedDate"
            type="date"
            value={form.appliedDate}
            onChange={(e) => setForm((p) => ({ ...p, appliedDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="jobUrl">Job URL</Label>
        <Input
          id="jobUrl"
          type="url"
          value={form.jobUrl}
          onChange={(e) => setForm((p) => ({ ...p, jobUrl: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="salary">Salary / Compensation</Label>
        <Input
          id="salary"
          value={form.salary}
          onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
          placeholder="$120k–$150k"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Any notes..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {error && <p className="text-sm text-red-500 self-center">{error}</p>}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
