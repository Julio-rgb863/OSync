import { cn, STATUS_OS } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
  showPulse?: boolean
}

export function StatusBadge({ status, className, showPulse }: StatusBadgeProps) {
  const config = STATUS_OS[status as keyof typeof STATUS_OS] || {
    label: status,
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border leading-none tracking-tight',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {(showPulse || status === 'EM_ANDAMENTO') && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {config.label}
    </span>
  )
}
