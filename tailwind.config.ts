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
        'monitor': '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
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
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'dot-1': 'dot-1 1.5s infinite',
        'dot-2': 'dot-2 1.5s infinite',
        'dot-3': 'dot-3 1.5s infinite',
        'pulse': 'pulse 2s infinite',
        'spin-reverse': 'spin-reverse 3s linear infinite',
        'pulse-linear': 'pulse-linear 2s ease-in-out infinite',
        'pulse-delay': 'pulse-delay 2.5s ease-in-out infinite',
      },
      backgroundImage: {
        'monitor-gradient': 'linear-gradient(to bottom, #444, #333, #222)',
        'monitor-base': 'linear-gradient(to bottom, #333, #111)',
      }
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.transform-gpu': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        },
        '.rotateX-5': {
          transform: 'rotateX(5deg)',
        },
        '.rotateX-80': {
          transform: 'rotateX(80deg)',
        },
        // Add these utilities for the monitor reflection effects
        '.monitor-screen-reflection::after': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '30%',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03), transparent)',
          pointerEvents: 'none',
        },
        '.monitor-base-reflection::after': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '40%',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.07), transparent)',
          pointerEvents: 'none',
        }
      }
      addUtilities(newUtilities)
    }
  ],
};

export default config;