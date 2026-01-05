/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                surface: "var(--color-surface)",
                primary: "#3b82f6",
                secondary: "#a1a1aa",
                accent: "#f59e0b",
                danger: "#ef4444",
                success: "#10b981",
                warning: "#f59e0b",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
