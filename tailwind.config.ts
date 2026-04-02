// filepath: d:\sde\codebase\cnicodebase\cni\cni-news-frontend\tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "cni-blue": "#1E40AF",
        "cni-blue-dark": "#1D4ED8",  // Assuming darker shade for hover
        "cni-blue-light": "#DBEAFE",  // Light blue for badges
        "cni-red": "#DC2626",  // Red for breaking news, etc.
        "cni-red-dark": "#B91C1C",  // Darker red for hover
      },
      fontFamily: {
        ui: ["var(--font-ui)", "sans-serif"],
        "source-serif": ["var(--font-source-serif)", "Georgia", "serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        ticker: "ticker 30s linear infinite",  // For scrolling ticker
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;