/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Bebas Neue", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      colors: {
        garage: {
          bg: "#0a0b0e",
          surface: "#111318",
          surface2: "#181b22",
          surface3: "#1f2330",
          amber: "#f59e0b",
          amberDim: "#b45309",
          green: "#10b981",
          red: "#ef4444",
          blue: "#3b82f6",
          text: "#f1f5f9",
          muted: "#94a3b8"
        }
      },
      borderRadius: {
        garage: "14px",
        garageLg: "20px",
        garageXl: "28px"
      },
      boxShadow: {
        garage: "0 16px 60px rgba(0,0,0,0.6)"
      }
    }
  },
  plugins: []
};
