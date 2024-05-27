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
        'xl': '28px',
        '2xl': '32px',
      },
      fontSize: {
        'base': '14px',
        'xxs': '10px',
      },
      colors: {
        'bg-window': 'rgba(0, 0, 0, 0.3)',
        'bg-searchbar': 'rgba(0, 0, 0, 0.075)',
        'bg-wdget': 'rgba(0, 0, 0, 0.1)',
        'bg-wdget-hover': 'rgba(0, 0, 0, 0.2)',
        'bg-wdget-active': 'rgba(0, 0, 0, 0.3)',
        // -------------------------------------
        'surface-main': 'rgba(255, 255, 255, 1)',
        'surface-750': 'rgba(255, 255, 255, 0.75)',
        'surface-500': 'rgba(255, 255, 255, 0.5)',
        'surface-400': 'rgba(255, 255, 255, 0.4)',
        'surface-100': 'rgba(255, 255, 255, 0.1)',
        // -------------------------------------
        'success-dark': '#027D1C',
        'success-regular': '#32D74B',
        'success-light': '#32DE4B',
        // -------------------------------------
        'error-dark': '#D70015',
        'error-regular': '#FF453A',
        'error-light': '#FF6861',
        // -------------------------------------
        'warning-dark': '#FFCC02',
        'warning-regular': '#FFD609',
        'warning-light': '#FFD426',
      },
      }
    },
  },
  plugins: [],
};
