/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'copper-roof': '#3A7D68', // Approximate verdigris/copper roof green
                'copper-roof-light': '#5C9E89',
                'copper-roof-dark': '#2A5C4C',
            }
        },
    },
    plugins: [],
}
