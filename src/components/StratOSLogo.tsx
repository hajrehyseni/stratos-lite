export function StratOSLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="hsl(0, 0%, 10%)" />
      <path
        d="M16 6L24 16L16 26L8 16Z"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 16H24"
        stroke="white"
        strokeWidth="1.2"
        opacity="0.4"
      />
    </svg>
  );
}
