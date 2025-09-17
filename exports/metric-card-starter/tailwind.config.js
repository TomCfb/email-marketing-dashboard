/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        card: 'hsl(0 0% 100%)',
        'card-foreground': 'hsl(222.2 47.4% 11.2%)',
        muted: 'hsl(210 40% 96.1%)',
        ring: 'hsl(221.2 83.2% 53.3%)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
