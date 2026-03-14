/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-green': '#006A4E', // Approximate GITAM green
                'brand-teal': '#1E8878',   // Login/My-GITAM teal
                'brand-light-green': '#E6F4F1',
                'brand-bg': '#F5F5F0', // Off-white/Beige background
                'login-bg': '#F5F0E9',    // Warm beige for login
                'brand-text': '#0F3D3E',
            }
        },
    },
    plugins: [],
}
