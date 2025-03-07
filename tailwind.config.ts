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
        'float': 'float 3s ease-in-out infinite',
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