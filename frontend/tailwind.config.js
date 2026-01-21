/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#175017',
                secondary: '#4CAF50',
            },
            fontFamily: {
                'serif': ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
}
