/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'zenith-primary': '#1e3a8a', // Koyu Mavi (Güven ve Ciddiyet)
        'zenith-accent': '#facc15', // Parlak Sarı (Vurgu ve Zirve)
        'zenith-bg': '#f3f4f6', // Açık Gri Arkaplan
      },
    },
  },
  plugins: [],
}