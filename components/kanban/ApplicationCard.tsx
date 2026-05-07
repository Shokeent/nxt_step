'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, ExternalLink, GripVertical } from 'lucide-react'
import type { JobApplication } from '@/types'
import { cn } from '@/lib/utils'

interface ApplicationCardProps {
  app: JobApplication
  onDelete: (id: string) => void
  isDragging?: boolean
}

export function ApplicationCard({ app, onDelete, isDragging }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete ${app.company} - ${app.role}?`)) return
    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onDelete(app.id)
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 shadow-sm group',
        (isDragging || isSortableDragging) && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{app.company}</p>
            <p className="text-xs text-gray-500 truncate">{app.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {app.appliedDate && (
        <p className="text-xs text-gray-400 mt-2 ml-5">
          {new Date(app.appliedDate).toLocaleDateString()}
        </p>
      )}
      {app.salary && (
        <p className="text-xs text-gray-500 mt-1 ml-5">{app.salary}</p>
      )}
    </div>
  )
}
