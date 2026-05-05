'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ApplicationForm } from './ApplicationForm'
import type { JobApplication, ApplicationStatus } from '@/types'

interface AddApplicationButtonProps {
  defaultStatus: ApplicationStatus
  onAdd: (app: JobApplication) => void
}

export function AddApplicationButton({ defaultStatus, onAdd }: AddApplicationButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <ApplicationForm
          defaultStatus={defaultStatus}
          onSuccess={(app) => {
            onAdd(app)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
