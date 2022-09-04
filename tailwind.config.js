/**
 * TailwindCSS Configuration
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
    mode: "jit",
    purge: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        colors: {
            green: "#3A871F",
            black: "#051A2D",
            white: "#FFFFFF",
            blacked: "rgb(42, 44, 48) !important",
            whited: "rgb(54, 57, 63) !important",
            current: "currentColor",
            transparent: "transparent",
        },
        fontFamily: {
            montserrat: ["Montserrat", "sans-serif"],
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
