module.exports = {
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      colors: {
        // Warm Vibrant Theme
        primary: {
          DEFAULT: "#F5C542",
          light: "#f7d670",
          dark: "#e8b320",
        },
        secondary: {
          DEFAULT: "#FF9F68",
          light: "#ffb388",
          dark: "#ff8a4a",
        },
        background: "#FFFDF8",
        surface: "#FFF7E9",
        text: {
          primary: "#2E2E2E",
          muted: "#7A6F64",
        },
        success: {
          DEFAULT: "#7AC77E",
          light: "#9fd6a2",
          dark: "#5fb863",
        },
        emerald: {
          600: "#059669",
          700: "#047857",
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "bounce-slow": "bounce 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        warm: "0 4px 20px rgba(245, 197, 66, 0.15)",
        "warm-lg": "0 8px 30px rgba(245, 197, 66, 0.2)",
        "warm-xl": "0 12px 40px rgba(255, 159, 104, 0.25)",
        glow: "0 0 20px rgba(245, 197, 66, 0.3)",
      },
    },
  },
};
