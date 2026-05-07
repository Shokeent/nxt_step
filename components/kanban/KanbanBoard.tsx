'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { JobApplication } from '@/types'
import type { ApplicationStatus } from '@/types'
import { STATUSES } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { ApplicationCard } from './ApplicationCard'

interface KanbanBoardProps {
  initialApplications: JobApplication[]
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null)
  const persistedStatuses = useRef<Record<string, ApplicationStatus>>(
    Object.fromEntries(initialApplications.map((a) => [a.id, a.status]))
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const app = applications.find((a) => a.id === event.active.id)
    setActiveApp(app ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const overStatus = STATUSES.includes(overId as ApplicationStatus)
      ? (overId as ApplicationStatus)
      : applications.find((a) => a.id === overId)?.status

    if (!overStatus) return

    setApplications((prev) =>
      prev.map((app) =>
        app.id === activeId ? { ...app, status: overStatus } : app
      )
    )
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveApp(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const overStatus = STATUSES.includes(overId as ApplicationStatus)
      ? (overId as ApplicationStatus)
      : applications.find((a) => a.id === overId)?.status

    if (!overStatus) return
    if (persistedStatuses.current[activeId] === overStatus) return

    const snapshot = [...applications]

    try {
      const res = await fetch(`/api/applications/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: overStatus }),
      })
      if (!res.ok) throw new Error()
      persistedStatuses.current[activeId] = overStatus
    } catch {
      setApplications(snapshot)
      toast.error('Failed to move card. Please try again.')
    }
  }

  function handleDelete(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id))
    delete persistedStatuses.current[id]
  }

  function handleAdd(app: JobApplication) {
    setApplications((prev) => [app, ...prev])
    persistedStatuses.current[app.id] = app.status
  }

  function handleEdit(updated: JobApplication) {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    persistedStatuses.current[updated.id] = updated.status as ApplicationStatus
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onEdit={handleEdit}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp ? (
          <ApplicationCard app={activeApp} onDelete={() => {}} onEdit={() => {}} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
