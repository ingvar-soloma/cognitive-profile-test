/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    // Base Backgrounds
                    bgMain: 'var(--color-brand-bgMain)',
                    bgCard: 'var(--color-brand-bgCard)',
                    bgCardHover: 'var(--color-brand-bgCardHover)',

                    // Typography
                    textPrimary: 'var(--color-brand-textPrimary)',
                    textSecondary: 'var(--color-brand-textSecondary)',

                    // Accents
                    accentPurple: 'var(--color-brand-accentPurple)',
                    accentPurpleHover: 'var(--color-brand-accentPurpleHover)',
                    accentBlue: 'var(--color-brand-accentBlue)',

                    // Utility
                    borderGlow: 'var(--color-brand-borderGlow)',
                    divider: 'var(--color-brand-divider)',
                }
            },
            fontFamily: {
                // Видалено Serif. Tech SaaS використовує виключно Sans-serif.
                sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'], // Для заголовків (H1-H3)
            },
            boxShadow: {
                'card': 'var(--shadow-card)',
                'glow': 'var(--shadow-glow)',
            }
        },
    },
    plugins: [],
}