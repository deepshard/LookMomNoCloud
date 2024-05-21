/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        'sm': '13px',
        'md': '18px',
        'lg': '24px',
      }
    },
  },
  plugins: [],
};
