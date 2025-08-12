/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Triptify elegant color palette inspired by example.html
        wescape: {
          bg: '#0b0d10',
          panel: 'rgba(255, 255, 255, 0.06)',
          'panel-strong': 'rgba(255, 255, 255, 0.12)',
          border: '#23262d',
          text: '#e9eef6',
          muted: '#9ba3af',
          brand: '#2563eb',
          'brand-quiet': '#1e40af',
          success: '#22c55e',
          warning: '#f59e0b',
        }
      },
      borderRadius: {
        'wescape': '18px',
      },
      boxShadow: {
        'wescape': '0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04)',
        'wescape-hover': '0 18px 45px rgba(0,0,0,.45)',
        'wescape-selected': '0 0 0 2px rgba(37,99,235,.9), 0 18px 45px rgba(0,0,0,.45)',
      },
      backdropBlur: {
        'wescape': '4px',
      },
      animation: {
        'subtle-float': 'subtle-float 3s ease-in-out infinite',
      },
      keyframes: {
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};