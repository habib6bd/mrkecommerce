import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effdf5",
          100: "#d8fbe8",
          200: "#b4f5d2",
          300: "#7debb1",
          400: "#3ed887",
          500: "#16b96a",
          600: "#0b9654",
          700: "#087845",
          800: "#095f39",
          900: "#084f31",
        },
      },
      boxShadow: { soft: "0 12px 32px rgba(15,23,42,.10)" },
    },
  },
  plugins: [],
};
export default config;
