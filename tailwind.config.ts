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
        background: {
          DEFAULT: "#FFFFFF",
          card: "#E4DEE4",
          active: "#EDE3E4",
          subtle: "#F9F8F9",
        },
        brand: {
          primary: "#231F20",
          secondary: "#92898A",
          muted: "#AF9FA5",
          accent: "#8B4254",
          accentHover: "#733344",
        },
        divider: "#E4DEE4",
        status: {
          available: "#16A34A",
          availableBg: "#F0FDF4",
          limited: "#D97706",
          limitedBg: "#FFFBEB",
          info: "#4F46E5",
          infoBg: "#EEF2FF",
          soldOut: "#E11D48",
          soldOutBg: "#FFF1F2",
          preparing: "#0284C7",
          preparingBg: "#F0F9FF",
          // Aliases
          free: "#16A34A",
          freeBg: "#F0FDF4",
          occupied: "#D97706",
          occupiedBg: "#FFFBEB",
          reserved: "#4F46E5",
          reservedBg: "#EEF2FF",
          danger: "#E11D48",
          dangerBg: "#FFF1F2",
          prep: "#0284C7",
          prepBg: "#F0F9FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        header: ["var(--font-lato)", "Lato", "system-ui", "sans-serif"],
        display: ["var(--font-lato)", "Lato", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        button: "10px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(35,31,32,0.05), 0 1px 2px -1px rgba(35,31,32,0.05)",
        elevated: "0 10px 15px -3px rgba(35,31,32,0.08)",
        drawer: "0 -10px 25px -5px rgba(35,31,32,0.12)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
