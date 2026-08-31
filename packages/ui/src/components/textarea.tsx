import * as React from 'react'
import { cn } from '#lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
