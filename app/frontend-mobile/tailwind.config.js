/** @type {import('tailwindcss').Config} */

const themeColors = ["approved", "pending", "rejected", "submitted", "draft", "waiting"];

module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  safelist: [
    ...themeColors.map((c) => `text-${c}`),
    ...themeColors.map((c) => `bg-${c}`),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#535252", // main
          light: "#6d6d6d",
          dark: "#3b3b3b",
        },
        secondary: {
          DEFAULT: "#f4f4f4",
          light: "#ffffff",
          dark: "#dcdcdc",
        },
        bg1: {
          DEFAULT: "#00495cff",
        },
        accent1: {
          DEFAULT: "#701a1aff",
        },
        approved: "#249707",
        pending: "#b6b90a",
        rejected: "#be1c1cff",
        submitted: "#0d5facff",
        waiting: "#ff9900ff",
        draft: "#474747ff",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};