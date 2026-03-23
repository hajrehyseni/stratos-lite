export function StratOSLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#logo-grad-v2)" />
      {/* Diamond / prism — single elegant geometric form */}
      <path
        d="M16 6L24 16L16 26L8 16Z"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Inner facet line — horizontal */}
      <path
        d="M8 16H24"
        stroke="white"
        strokeWidth="1.2"
        opacity="0.5"
      />
      {/* Inner facet lines — top to mid */}
      <path
        d="M16 6L8 16M16 6L24 16"
        stroke="white"
        strokeWidth="0.8"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="logo-grad-v2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(225, 84%, 48%)" />
          <stop offset="1" stopColor="hsl(225, 84%, 32%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
