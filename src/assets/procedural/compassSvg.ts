export function generateCompassSvgDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="56" fill="#0B1622" stroke="#1E3A5F" stroke-width="2"/>
    <polygon points="60,12 66,58 60,50 54,58" fill="#ef4444"/>
    <polygon points="60,108 66,62 60,70 54,62" fill="#94a3b8"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
