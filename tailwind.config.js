/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        'xs': '8px',
        'sm': '13px',
        'md': '18px',
        'lg': '24px',
      },
      backgroundColor: {
        'success-dark': '#027D1C',
        'success': '#32D74B',
        'success-light': '#32DE4B',
        'danger-dark': '#FF453A',
        'danger': '#FF453A',
        'danger-light': '#FF6861',
        'warning-dark': '#FFCC02',
        'warning': '#FFD609',
        'warning-light': '#FFD426',

      }
    },
  },
  plugins: [],
};
