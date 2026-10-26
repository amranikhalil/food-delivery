/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Benny's design tokens (see desgin-reference/bennys-design-system.md)
      colors: {
        red: { DEFAULT: "#D7262E", dark: "#B71C24" },
        ink: "#141414",
        cream: { DEFAULT: "#F6F5E8", warm: "#FBF1E2" },
        "text-secondary": "#3A3A35",
        "text-muted": "#4A4A44",
        "text-label": "#5A5A52",
        "on-dark-muted": "#C9C9BE",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      fontSize: {
        "display-xl": ["clamp(56px, 8vw, 104px)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-l": ["clamp(52px, 7vw, 96px)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-m": ["clamp(44px, 6vw, 72px)", { lineHeight: "1" }],
      },
      letterSpacing: {
        desc: "0.04em",
        button: "0.08em",
        item: "0.12em",
        micro: "0.18em",
        label: "0.2em",
        tagline: "0.22em",
        eyebrow: "0.24em",
      },
      maxWidth: { container: "1240px" },
      spacing: { 22: "88px" },
      borderRadius: { tag: "8px", card: "24px", photo: "28px" },
      boxShadow: {
        photo: "0 24px 48px rgba(20,20,20,0.22)",
        drawer: "-24px 0 48px rgba(20,20,20,0.22)",
      },
    },
  },
  plugins: [],
};
