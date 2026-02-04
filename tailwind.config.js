/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          lime: "#b8e986",
          "lime-dim": "#8bc34a",
          "lime-bright": "#d4f5a4",
        },
        surface: {
          dark: "#0f0f0f",
          card: "#1a1a1a",
          elevated: "#242424",
        },
      },
    },
  },
  plugins: [],
};
