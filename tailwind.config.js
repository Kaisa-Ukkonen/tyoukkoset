/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#ffcc00",
          dark: "#000000",
          gray: "#1a1a1a",
        },
      },
    },
  },
  plugins: [],
};
