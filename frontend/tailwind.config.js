/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#111827',       // gray-900
          'text-primary': '#374151', // Un gris oscuro más suave si se prefiere
          secondary: '#6B7280', // Un gris neutro para acciones secundarias
          'secondary-dark': '#4B5563', // blue-600
          accent: '#EAB308',         // yellow-500
          'accent-dark': '#CA8A04',  // yellow-600
          danger: '#DC2626',         // red-600
        },
        ui: {
          background: '#F3F4F6', // gray-100
          surface: '#FFFFFF',    // white
          text: {
            primary: '#1F2937',   // gray-800
            secondary: '#6B7280', // gray-500
            light: '#F9FAFB',     // gray-50 (on dark backgrounds)
          },
          border: '#E5E7EB',     // gray-200
        },
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
