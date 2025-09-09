/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#535252ff",
        approved: "#249707ff",
        pending: "#b6b90aff",
        rejected: "#bb0000ff"
      }
    },
  },
  plugins: [],
}

