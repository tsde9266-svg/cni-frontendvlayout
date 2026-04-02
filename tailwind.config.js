/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        site: '1280px',
      },
      colors: {
        background:       "var(--background)",
        foreground:       "var(--foreground)",
        "cni-blue":       "#012169",
        "cni-blue-dark":  "#011452",
        "cni-blue-light": "#DBEAFE",
        "cni-red":        "#DC2626",
        "cni-red-dark":   "#B91C1C",
        "cni-red-light":  "#FEE2E2",
      },
      fontFamily: {
        // --font-inter  comes from Inter in root layout
        // --font-playfair comes from Playfair_Display
        // --font-source-serif comes from Source_Serif_4
        ui:            ["var(--font-inter)",        "system-ui", "sans-serif"],
        headline:      ["var(--font-playfair)",      "Georgia",  "serif"],
        body:          ["var(--font-source-serif)",  "Georgia",  "serif"],
        "source-serif":["var(--font-source-serif)",  "Georgia",  "serif"],
        playfair:      ["var(--font-playfair)",       "Georgia",  "serif"],
      },
      animation: {
        "pulse-red": "pulseRed 1.5s ease-in-out infinite",
        "slide-in":  "slideIn 0.3s ease-out",
        ticker:      "tickerScroll 40s linear infinite",
      },
      keyframes: {
        pulseRed: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.4" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        tickerScroll: {
          "0%":   { transform: "translateX(20vw)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

module.exports = config;
