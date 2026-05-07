'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Trash2, Download, Search } from 'lucide-react'
import type { ApplicationStatus, JobApplication } from '@/types'
import { STATUSES, STATUS_LABELS } from '@/types'
import { Badge } from '@/components/ui/badge'

export function ApplicationsTable({ initialApplications }: { initialApplications: JobApplication[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return applications.filter((app) => {
      const matchesSearch =
        q === '' ||
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  async function handleDelete(app: JobApplication) {
    if (!confirm(`Delete ${app.company} - ${app.role}?`)) return
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setApplications((prev) => prev.filter((a) => a.id !== app.id))
      toast.success('Application deleted')
    } catch {
      toast.error('Failed to delete. Please try again.')
    }
  }

  function exportCSV() {
    const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Salary', 'Job URL', 'Notes']
    const rows = filtered.map((app) => [
      app.company,
      app.role,
      STATUS_LABELS[app.status as ApplicationStatus],
      app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '',
      app.salary ?? '',
      app.jobUrl ?? '',
      app.notes ?? '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'applications.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>
              {applications.length === 0
                ? 'No applications yet. Add one from the board.'
                : 'No results match your filters.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.company}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{app.role}</td>
                  <td className="px-4 py-3">
                    <Badge status={app.status as ApplicationStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{app.salary ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(app)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && filtered.length !== applications.length && (
        <p className="text-sm text-gray-400 text-right">
          Showing {filtered.length} of {applications.length}
        </p>
      )}
    </div>
  )
}
