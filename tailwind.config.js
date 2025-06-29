/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  presets: [
    require("nativewind/preset")
  ],
  theme: {
    extend: {
      colors: {
        background: "#44c3d4",
        primary: "#ffffff",
        accent: "#FDE232"
        // accent: "#aa8833"
      }
    },
  },
  plugins: [],
}

