import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Verified Graphite" palette — all from CSS variables
        "bg-base":    "var(--bg-base)",
        "surface-1":  "var(--surface-1)",
        "surface-2":  "var(--surface-2)",
        accent: {
          cyan:    "#22D3EE",
          purple:  "#A78BFA",
          emerald: "#34D399",
          amber:   "#FBBF24",
          rose:    "#FB7185",
        },
        text: {
          primary: "var(--text-primary)",
          muted:   "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      borderColor: {
        hairline: "rgba(255,255,255,0.08)",
        "hairline-light": "rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,211,238,0.15)",
        "glow-emerald": "0 0 20px rgba(52,211,153,0.2)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
        float: "0 4px 32px rgba(0,0,0,0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "skeleton":   "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },
      maxWidth: {
        canvas: "1100px",
      },
    },
  },
  plugins: [],
};

export default config;
