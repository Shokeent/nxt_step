'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { JobApplication, ApplicationStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { ApplicationCard } from './ApplicationCard'
import { AddApplicationButton } from '../forms/AddApplicationButton'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  status: ApplicationStatus
  applications: JobApplication[]
  onDelete: (id: string) => void
  onAdd: (app: JobApplication) => void
}

export function KanbanColumn({ status, applications, onDelete, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              STATUS_COLORS[status]
            )}
          >
            {STATUS_LABELS[status]}
          </span>
          <span className="text-sm text-gray-500">{applications.length}</span>
        </div>
        <AddApplicationButton defaultStatus={status} onAdd={onAdd} />
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 min-h-[200px] rounded-lg p-2 transition-colors',
          isOver ? 'bg-blue-50' : 'bg-gray-50'
        )}
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} onDelete={onDelete} />
          ))}
        </SortableContext>
        {applications.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Drop here</p>
        )}
      </div>
    </div>
  )
}
