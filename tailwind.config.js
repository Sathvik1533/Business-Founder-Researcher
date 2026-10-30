/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          canvas: "#F6F7F9",
          surface: "#FFFFFF",
          subtle: "#F9FAFB",
          border: "#E2E5E9",
          text: "#192130",
          muted: "#64748B",
          faint: "#94A3B8",
        },
        accent: {
          blue: "#2563EB",
          blueLight: "#EFF6FF",
          emerald: "#059669",
          emeraldLight: "#ECFDF5",
          amber: "#D97706",
          amberLight: "#FFFBEB",
          rose: "#E11D48",
          roseLight: "#FFF1F2",
        }
      },
      boxShadow: {
        'clay-card': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -2px 3px 0 rgba(0, 0, 0, 0.03)',
        'clay-btn': '0 4px 10px -2px rgba(0, 0, 0, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.05)',
        'clay-btn-active': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'clay-pressed': 'inset 0 3px 6px 0 rgba(0, 0, 0, 0.06), inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'clay-pill': '0 2px 6px -1px rgba(0, 0, 0, 0.05), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.9)',
        'clay-float': '0 20px 35px -10px rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
      },
      borderRadius: {
        'clay-sm': '12px',
        'clay': '18px',
        'clay-lg': '24px',
        'clay-xl': '32px',
      }
    },
  },
  plugins: [],
}
