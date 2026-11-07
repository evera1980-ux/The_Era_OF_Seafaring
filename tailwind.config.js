/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bridge: {
          bg: "#07131F",
          panel: "#0D1F2D",
          panelLight: "#132B3B",
          accent: "#35C6D8",
          highlight: "#56D9E8",
          safe: "#35D39A",
          warning: "#F5B942",
          danger: "#FF5A5F",
          text: "#EAF4FA",
          textMuted: "#8EA7B8",
          border: "#234052",
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
