import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F6F2",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#556B2F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#D4AF37",
          foreground: "#1a1a1a",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1a1a1a",
        },
        muted: {
          DEFAULT: "#EDEAE4",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#D4AF37",
          foreground: "#1a1a1a",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        border: "#E5E0D8",
        input: "#E5E0D8",
        ring: "#556B2F",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
