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
    },
    animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        float: 'float 3s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
  },
  plugins: [],
};

export default config;