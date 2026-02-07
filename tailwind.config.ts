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
          50: "#fdfbf4",
          100: "#faf6e8",
          200: "#f5ecd1",
          300: "#f0ddb5",
          400: "#e6bc78",
          500: "#d4a855",
          600: "#b8893d",
          700: "#9c6d31",
          800: "#6b4620",
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
          700: "#3d3d3d",
          800: "#2d2d2d",
          900: "#1a1a1a",
        },
        "luxury-dark": "#0f0f0f",
        "luxury-bg": "#1a1a1a",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #d4a855 0%, #b8893d 100%)",
        "gradient-dark": "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
