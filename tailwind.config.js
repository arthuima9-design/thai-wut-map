/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        risk: {
          normal: '#10B981',    // 🟢 ปกติ (Emerald 500)
          watch: '#F59E0B',     // 🟡 เฝ้าระวัง (Amber 500)
          warning: '#F97316',   // 🟠 เสี่ยง (Orange 500)
          danger: '#EF4444',    // 🔴 อันตราย (Red 500)
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
