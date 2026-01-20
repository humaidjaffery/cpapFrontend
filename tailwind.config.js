/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}", 
    "./app/globals.css"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#000000',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937',
        },
        primary: {
          DEFAULT: '#007AFF',
          dark: '#0A84FF',
        },
        secondary: {
          DEFAULT: '#6B7280',
          dark: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
        },
      },
    },
  },
  plugins: [],
}


