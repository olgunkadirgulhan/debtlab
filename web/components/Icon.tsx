const PATHS: Record<string, React.ReactNode> = {
  snowball: (
    <>
      <circle cx="12" cy="14" r="7" />
      <circle cx="12" cy="6" r="3.5" />
    </>
  ),
  avalanche: <path d="M3 20 10 8l3.5 5L16 9l5 11Z" />,
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="m12 17 4-5" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Z" />,
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M5 7h14M10 7V5h4v2m-6 0 1 12h6l1-12" />,
};

export default function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
