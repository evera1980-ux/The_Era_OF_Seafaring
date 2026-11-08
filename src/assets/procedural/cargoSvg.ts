import { AssetKey } from "../../types";

export function generateCargoSvgDataUri(assetKey: AssetKey): string {
  let color = "#38bdf8";
  if (assetKey === "cargo.oil") color = "#f59e0b";
  if (assetKey === "cargo.ore") color = "#10b981";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="6" y="10" width="28" height="20" rx="3" fill="#0f172a" stroke="${color}" stroke-width="2"/>
    <line x1="14" y1="10" x2="14" y2="30" stroke="${color}" stroke-width="1.5"/>
    <line x1="26" y1="10" x2="26" y2="30" stroke="${color}" stroke-width="1.5"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
