// PostCSS config aligned with Tailwind CSS v4+ guidance and Vite ESM setup.
// Use the dedicated @tailwindcss/postcss plugin instead of "tailwindcss" directly.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};