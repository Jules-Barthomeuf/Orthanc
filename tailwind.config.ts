import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fefcf5",
          100: "#fdf8e8",
          200: "#f9edd0",
          300: "#f0ddb5",
          400: "#c9a96e",
          500: "#b8944d",
          600: "#9a7a3d",
          700: "#7c6131",
          800: "#5a4424",
          900: "#3d2813",
        },
        dark: {
          50: "#f7f7f7",
          100: "#eeeeee",
          200: "#e2e2e2",
          300: "#cbcbcb",
          400: "#8b8b8b",
          500: "#757575",
          600: "#545454",
          700: "#1c1c1c",
          800: "#141414",
          900: "#0a0a0a",
        },
        "luxury-dark": "#0a0a0a",
        "luxury-bg": "#111111",
      },
      fontFamily: {
        display: ["var(--font-display)", "DM Serif Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #c9a96e 0%, #f0ddb5 50%, #c9a96e 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
      },
      letterSpacing: {
        luxury: "0.25em",
      },
    },
  },
  plugins: [],
};
export default config;
