import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'device': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'dot-1': {
          '0%, 20%': { opacity: '0' },
          '40%, 100%': { opacity: '1' },
        },
        'dot-2': {
          '0%, 40%': { opacity: '0' },
          '60%, 100%': { opacity: '1' },
        },
        'dot-3': {
          '0%, 60%': { opacity: '0' },
          '80%, 100%': { opacity: '1' },
        }
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'dot-1': 'dot-1 1.5s infinite',
        'dot-2': 'dot-2 1.5s infinite',
        'dot-3': 'dot-3 1.5s infinite',
      }
    },
  },
  plugins: [],
};

export default config;