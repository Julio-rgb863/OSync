interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
}

export function Logo({ className = '', size = 28, showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Dual-Vector Interlocking Loop Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 text-primary"
      >
        {/* Continuous precision synchronization paths */}
        <path
          d="M7 16C7 11.5817 10.5817 8 15 8C19.4183 8 20.5817 12 25 12C27.2091 12 29 13.7909 29 16C29 18.2091 27.2091 20 25 20C20.5817 20 19.4183 24 15 24C10.5817 24 7 20.4183 7 16Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="16" r="2" fill="currentColor" />
        <circle cx="25" cy="16" r="2" fill="currentColor" />
      </svg>

      {showWordmark && (
        <span className="font-semibold text-[17px] tracking-[-0.03em] text-foreground font-sans">
          OSync
        </span>
      )}
    </div>
  )
}
