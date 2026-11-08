import { AssetKey } from "../../types";

export function generateWeatherSvgDataUri(assetKey: AssetKey): string {
  let svg = "";
  if (assetKey === "weather.storm") {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path d="M14 28h22a8 8 0 0 0 1-15.9A11 11 0 0 0 16 11a9 9 0 0 0-2 17z" fill="#334155" stroke="#f59e0b" stroke-width="1.5"/>
      <polygon points="24,26 19,36 25,36 22,45 31,33 25,33" fill="#f59e0b"/>
    </svg>`;
  } else if (assetKey === "weather.cloudy") {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path d="M14 32h22a8 8 0 0 0 1-15.9A11 11 0 0 0 16 15a9 9 0 0 0-2 17z" fill="#475569" stroke="#38bdf8" stroke-width="1.5"/>
    </svg>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
    </svg>`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
