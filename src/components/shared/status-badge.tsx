import { cn, STATUS_OS } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
  showPulse?: boolean
}

export function StatusBadge({ status, className, showPulse }: StatusBadgeProps) {
  const config = STATUS_OS[status as keyof typeof STATUS_OS] || {
    label: status,
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {(showPulse || status === 'EM_ANDAMENTO') && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.bg)} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {config.label}
    </span>
  )
}
