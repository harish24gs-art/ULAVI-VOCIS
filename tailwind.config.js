export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Playfair Display", "Georgia", "serif"]
      },
      colors: {
        ink: "#07090f",
        graphite: "#111827",
        pearl: "#f6f3eb",
        champagne: "#d7b46a",
        jade: "#30c7a3",
        skyglass: "#9cc7ff",
        ember: "#f47f63"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(215, 180, 106, 0.22)",
        glass: "0 18px 60px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
