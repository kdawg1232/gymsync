/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "pastel-orange": "#F9C38E",
        "pastel-purple": "#959BFF",
        "pastel-green": "#93E2D5",
        "pastel-pink": "#FF9B9B",
        "pastel-yellow": "#FCD299",
        "pastel-blue": "#89CFF0",
        "pastel-red": "#FF6B6B",
      },
      fontFamily: {
        sans: ["Quicksand"],
        quicksand: ["Quicksand"],
      },
    },
  },
  plugins: [],
};
