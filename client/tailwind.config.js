/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(15,23,42,0.35)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(34,211,238,0.18), transparent 30%), radial-gradient(circle at top right, rgba(16,185,129,0.16), transparent 25%), linear-gradient(135deg, rgba(8,15,31,0.98), rgba(12,19,38,0.94))"
      }
    }
  },
  plugins: []
};
