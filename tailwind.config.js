/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],

  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./api/**/*.{js,jsx,ts,tsx}",
    "./*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BACKGROUNDS
        surface: "#F4F6FB",
        inputSurface: "#EEF2FA",
        navtab: "#0D1A3A",
        activeflight: "#1A2852",

        // Brand Colors
        primaryBrand: "#1568C4",
        nova: "#7B5FE8",
        highlights: "#5BACF5",

        // Status colors
        statusD: "#1A7A48",
        statusA: "#E8A020",
        statusUL: "#C84B4B",
        statusI: "#E8EFFC",

        // Text Colors
        primary: "#0D1A3A",
        secondary: "#3A4863",
        meta: "#7B8BAA",

        // Borders
        borderDefault: "#E3E8F4",
        borderEmphasis: "#C9D4E8",
      },

      spacing: {
        // "p-xs"

        xs: "4px", // Extra small (icons/tight text)
        sm: "8px", // Small (inner padding)
        md: "16px", // Medium (Standard card padding/page margins)
        lg: "24px", // Large (Section spacing)
        xl: "32px", // Extra Large (Big headers)
        "2xl": "48px", // Double extra large
        "3xl": "64px", // Triple extra large
      },

      fontSize: {
        // "text-2xl"

        xs: ["12px", { lineHeight: "16px" }], // Captions/Meta
        sm: ["14px", { lineHeight: "20px" }], // Small body/Helper
        base: ["16px", { lineHeight: "24px" }], // Standard Body
        lg: ["18px", { lineHeight: "26px" }], // Large Body/List headers
        xl: ["20px", { lineHeight: "28px" }], // Sub-headers
        "2xl": ["24px", { lineHeight: "32px" }], // Screen titles
        "3xl": ["32px", { lineHeight: "40px" }], // Large flight numbers/Hero
      },

      borderRadius: {
        // "rounded-sm"

        none: "0",
        sm: "4px",
        md: "8px", // Buttons/Small inputs
        lg: "12px", // Standard Cards
        xl: "16px", // Large Modals/Outer containers
        "2xl": "24px", // Distinctive branding blocks
        full: "9999px", // Pill buttons/Avatar orbs
      },

      boxShadow: {
        // "shadow-card"

        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        card: "0 2px 8px rgba(13, 26, 58, 0.08)",
      },
    },
  },
  plugins: [],
};
