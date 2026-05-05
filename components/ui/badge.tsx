import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/types'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ApplicationStatus
}

export function Badge({ className, status, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        status ? STATUS_COLORS[status] : 'bg-gray-100 text-gray-700',
        className
      )}
      {...props}
    >
      {status ? STATUS_LABELS[status] : children}
    </span>
  )
}
