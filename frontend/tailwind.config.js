/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sage: {
                    50: '#eaefe8',
                    100: '#d7e2d3',
                    800: '#3e4f44',
                    900: '#2b372f',
                    DEFAULT: '#3e4f44', // Dark Sage Green
                },
                beige: {
                    100: '#f8f4eb',
                    DEFAULT: '#f4ecd8', // Warm Beige
                    900: '#d3c1a3',
                },
                copper: {
                    DEFAULT: '#b86b3e', // Copper
                    hover: '#9a562f',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
