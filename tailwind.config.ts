import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"] ,
  theme: {
    extend: {
      colors: {
        scouthub: {
          bg: "#F7FAF8",
          tint: "#EAF5EF",
          green: "#2E7D5B",
          gold: "#D4A937",
          text: "#1A1A1A",
          muted: "#6B7280",
          live: "#DC2626"
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(14, 39, 28, 0.10)",
        lift: "0 18px 40px rgba(14, 39, 28, 0.14)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 1.5s ease-in-out infinite",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
