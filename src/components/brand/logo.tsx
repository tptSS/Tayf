export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      className={className}
      role="img"
      aria-label="Tayf logosu"
    >
      <rect width="56" height="56" rx="14" fill="#0E1116" />
      <rect x="10" y="25" width="16" height="6" rx="3" fill="#F4F5F7" />
      <path
        d="M26 28 L46 14"
        stroke="#FF5A36"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 28 L47 23"
        stroke="#FFB020"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 28 L47 33"
        stroke="#22C493"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 28 L46 42"
        stroke="#3D7BFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-8 w-8" />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        tayf
      </span>
    </span>
  );
}
