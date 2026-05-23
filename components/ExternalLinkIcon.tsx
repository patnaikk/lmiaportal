interface Props {
  className?: string
  size?: number
}

/**
 * Small inline arrow indicating an external destination.
 * Apple-style: subtle, sits at the end of link text.
 */
export default function ExternalLinkIcon({ className = '', size = 11 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ml-0.5 opacity-60 ${className}`}
      aria-hidden="true"
    >
      <path d="M7 17L17 7"/>
      <path d="M7 7h10v10"/>
    </svg>
  )
}
