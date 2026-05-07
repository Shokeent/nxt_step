'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ApplicationStatus, JobApplication } from '@/types'
import { STATUSES, STATUS_LABELS } from '@/types'

interface EditApplicationDialogProps {
  app: JobApplication
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updated: JobApplication) => void
}

export function EditApplicationDialog({ app, open, onOpenChange, onSave }: EditApplicationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company: app.company,
    role: app.role,
    status: app.status as ApplicationStatus,
    appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
    jobUrl: app.jobUrl ?? '',
    salary: app.salary ?? '',
    notes: app.notes ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          appliedDate: form.appliedDate || null,
          jobUrl: form.jobUrl || null,
          salary: form.salary || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onSave(updated)
      onOpenChange(false)
      toast.success('Application updated')
    } catch {
      toast.error('Failed to update application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-company">Company *</Label>
              <Input
                id="edit-company"
                required
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-role">Role *</Label>
              <Input
                id="edit-role"
                required
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
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
              <Label htmlFor="edit-date">Date Applied</Label>
              <Input
                id="edit-date"
                type="date"
                value={form.appliedDate}
                onChange={(e) => setForm((p) => ({ ...p, appliedDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-jobUrl">Job URL</Label>
            <Input
              id="edit-jobUrl"
              type="url"
              value={form.jobUrl}
              onChange={(e) => setForm((p) => ({ ...p, jobUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-salary">Salary / Compensation</Label>
            <Input
              id="edit-salary"
              value={form.salary}
              onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
              placeholder="$120k–$150k"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
