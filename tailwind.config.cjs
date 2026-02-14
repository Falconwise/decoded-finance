/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                sage: {
                    DEFAULT: '#7A8B72',
                    50: '#f4f6f3',
                    100: '#e5e9e3',
                    200: '#c9d2c5',
                    300: '#a5b29e',
                    400: '#7A8B72',
                    500: '#6a7b62',
                    600: '#54634e',
                    700: '#434f3f',
                    800: '#384135',
                    900: '#2f362d',
                },
                copper: {
                    DEFAULT: '#B86E4B',
                    50: '#fbf3ef',
                    100: '#f5e2d8',
                    200: '#ebc3af',
                    300: '#dea080',
                    400: '#B86E4B',
                    500: '#a96040',
                    600: '#8e4d34',
                    700: '#753e2c',
                    800: '#613429',
                    900: '#522d24',
                },
                alabaster: '#F4F1EA',
                graphite: '#333333',
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Lato', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            spacing: {
                'xs': '8px',
                'sm-brand': '16px',
                'md-brand': '24px',
                'lg-brand': '40px',
                'xl-brand': '60px',
            },
        },
    },
    plugins: [],
};
