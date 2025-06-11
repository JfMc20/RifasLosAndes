/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7FAFC',
        text: '#2D3748',
        primary: '#2C5282',
        accent: '#F7B538',
      },
      fontFamily: {
        'title': ['Oswald', 'sans-serif'],
        'body': ['Lato', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
