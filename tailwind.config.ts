import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "'Inter'", "'Roboto'", "sans-serif"],
        display: ["var(--font-oswald)", "'Oswald'", "'Bebas Neue'", "sans-serif"],
        oswald: ["var(--font-oswald)", "'Oswald'", "'Bebas Neue'", "sans-serif"],
        inter: ["var(--font-inter)", "'Inter'", "'Roboto'", "sans-serif"],
        mokoto: ["var(--font-oswald)", "'Oswald'", "'Bebas Neue'", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          DEFAULT: "#df2531",
          crimson: "#df2531",
          secondary: "rgba(223, 37, 49, 0.65)",
          subtle: "rgba(223, 37, 49, 0.45)",
          glow: "rgba(223, 37, 49, 0.35)",
          dark: "#000000",
          card: "#0a0a0a",
          surface: "#121212",
        },
        primary: {
          DEFAULT: "#df2531",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#df2531",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ethiopia: {
          green: "#078930",
          yellow: "#FCDD09",
          red: "#df2531",
          gold: "#df2531",
          dark: "#000000",
          slate: "#121212",
          accent: "#df2531",
          machinery: "#df2531",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
