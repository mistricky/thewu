/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{svelte,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      rubik: ["Rubik", "sans-serif"],
    },
    extend: {
      colors: {
        "shallow-dark": "#161616",
        dark: "#0a0a0a",
        "gray-white": "#f7f8f8",
      },
    },
  },
  plugins: [],
}
