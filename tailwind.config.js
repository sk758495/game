/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E3A8A",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#6D28D9",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#14B8A6",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "wave-slow": {
          "0%, 100%": { 
            transform: "translateY(0%) rotate(0deg)",
            opacity: 0.3
          },
          "50%": { 
            transform: "translateY(-2%) rotate(1deg)",
            opacity: 0.5
          }
        },
        "wave-slower": {
          "0%, 100%": { 
            transform: "translateY(0%) rotate(0deg)",
            opacity: 0.3
          },
          "50%": { 
            transform: "translateY(2%) rotate(-1deg)",
            opacity: 0.5
          }
        },
        "wave-slowest": {
          "0%, 100%": { 
            transform: "translateY(-1%) rotate(0deg)",
            opacity: 0.3
          },
          "50%": { 
            transform: "translateY(1%) rotate(1deg)",
            opacity: 0.5
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wave-slow": "wave-slow 7s ease-in-out infinite",
        "wave-slower": "wave-slower 10s ease-in-out infinite",
        "wave-slowest": "wave-slowest 13s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

