/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI konsepti için gerekli tüm renk değişkenleri, global.css'teki isimlerle eşleşmeli.
        "zenith-turq": "rgb(var(--zenith-turq) / <alpha-value>)",
        "zenith-bg": "rgb(var(--zenith-bg) / <alpha-value>)",
        "zenith-bg-2": "rgb(var(--zenith-bg-2) / <alpha-value>)", // AI için derin arka plan
        "zenith-surface": "rgb(var(--zenith-surface) / <alpha-value>)",
        "zenith-ink": "rgb(var(--zenith-ink) / <alpha-value>)",
        "zenith-muted": "rgb(var(--zenith-muted) / <alpha-value>)",
        "zenith-primary": "rgb(var(--zenith-primary) / <alpha-value>)",
        "zenith-accent": "rgb(var(--zenith-accent) / <alpha-value>)",
        "zenith-accent-soft": "rgb(var(--zenith-accent-soft) / <alpha-value>)",
        "zenith-border": "rgb(var(--zenith-border) / <alpha-value>)",
      },
      fontFamily: {
        // Tailwind'de sans fontunuzu global.css'teki değişkenden almalı
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Orijinal gölgeler
        zenith: "0 12px 30px rgba(2, 6, 23, 0.08)",
        "zenith-lg": "0 20px 60px rgba(2, 6, 23, 0.12)",
        "zenith-inner": "inset 0 1px 0 rgba(255,255,255,0.6)",
        
        // ✨ Yapay Zeka (AI) Neon Gölge Entegrasyonu
        // global.css'teki AI efektlerini Tailwind sınıfı olarak kullanmak için
        "ai-glow-soft": "0 0 10px rgba(92, 200, 255, 0.35)",
        "ai-glow-strong": "0 0 15px rgba(92, 200, 255, 0.8), 0 0 30px rgba(92, 200, 255, 0.6)",
      },
      borderRadius: {
        zenith: "1.25rem",
      },
      keyframes: {
        // Orijinal kart giriş animasyonu (zenithIn olarak tanımladık)
        "card-in": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // Premium yavaş parıltı (soft-glow)
        "soft-glow": {
          "0%,100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.02)" },
        },
        // Shimmer loading (global.css'te de tanımlıydı, burada da tutuldu)
        shimmer: {
          "0%": { backgroundPosition: "0% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        // Mikro hover float
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        // Yeni AI Pulsing Glow (Butonlar ve Önemli Kartlar İçin)
        "ai-pulse": {
          "0%, 100%": { "box-shadow": "0 0 5px var(--zenith-turq)" },
          "50%": { "box-shadow": "0 0 15px var(--zenith-turq), 0 0 25px rgba(92, 200, 255, 0.4)" },
        }
      },
      animation: {
        "card-in": "card-in .42s cubic-bezier(.16,.84,.24,1) both",
        "soft-glow": "soft-glow 6.5s ease-in-out infinite",
        shimmer: "shimmer 1.2s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        // Yeni AI Animasyonu
        "ai-pulse": "ai-pulse 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};