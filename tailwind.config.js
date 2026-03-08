/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./constants.ts",
        "./translations.ts",
        "./types.ts",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    // Base colors
                    paper: '#F9F8F6',     // Warm white for page background
                    graphite: '#2D2C2A',  // Soft black for main text

                    // Accent colors
                    ink: '#5E4B8B',       // Ink purple (Primary)
                    inkHover: '#4A3B70',  // Darker ink for hover states
                    clay: '#E87A5D',      // Terracotta (Secondary/Micro-accents)
                    sage: '#4A7C59',      // Sage green (Success/Completed)
                }
            },
            fontFamily: {
                // Our custom fonts
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            },
            boxShadow: {
                // Soft shadows for an elegant magazine feel
                'soft': '0 4px 20px -2px rgba(45, 44, 42, 0.05)',
                'card': '0 2px 10px -1px rgba(45, 44, 42, 0.03), 0 1px 3px -1px rgba(45, 44, 42, 0.05)',
            }
        },
    },
    plugins: [],
}
