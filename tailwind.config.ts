import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kringle: {
          spruce: "#0f5132",
          cranberry: "#a4161a",
          snow: "#f7f7f5",
          gold: "#e0b23e",
          ice: "#7fb3d5",
        },
      },
      keyframes: {
        "kk-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "kk-pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "kk-slide-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "kk-sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "kk-float": "kk-float 3.2s ease-in-out infinite",
        "kk-pop-in": "kk-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "kk-slide-up": "kk-slide-up 0.5s ease-out both",
        "kk-sheet-up": "kk-sheet-up 0.3s cubic-bezier(0.32, 0.72, 0, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
