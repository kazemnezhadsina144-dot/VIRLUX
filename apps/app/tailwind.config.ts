import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        virlux: {
          bg: "#060b14",
          surface: "#0c1220",
          card: "#111827",
          border: "#1e293b",
          accent: "#2563eb",
          "accent-light": "#3b82f6",
          mint: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(37, 99, 235, 0.3)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "app-gradient": "radial-gradient(ellipse 70% 50% at 0% 0%, rgba(37,99,235,0.12), transparent)",
      },
    },
  },
  plugins: [],
};
export default config;
