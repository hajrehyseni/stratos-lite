export function StratOSLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" fill="url(#logo-grad)" />
      <path
        d="M16 7L22 11V15L16 19L10 15V11L16 7Z"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 17L16 21L22 17"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path
        d="M10 21L16 25L22 21"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(221, 83%, 53%)" />
          <stop offset="1" stopColor="hsl(221, 83%, 40%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
