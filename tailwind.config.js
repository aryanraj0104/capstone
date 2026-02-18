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
                'brand-light-green': '#E6F4F1',
                'brand-bg': '#F5F5F0', // Off-white/Beige background
                'brand-text': '#0F3D3E',
            }
        },
    },
    plugins: [],
}
