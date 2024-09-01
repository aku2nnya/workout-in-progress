const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [
        plugin(function ({ addUtilities }) {
            addUtilities({
                '.scrollbar-hide': {
                  /* IE and Edge */
                  '-ms-overflow-style': 'none',

                  /* Firefox */
                  'scrollbar-width': 'none',

                  /* Safari and Chrome */
                  '&::-webkit-scrollbar': {
                      display: 'none',
                  },
                },
                '.arrow-hide': {
                  /* Chrome, Safari, Edge, Opera */
                  '&::-webkit-inner-spin-button':{
                    '-webkit-appearance': 'none',
                    'margin': 0
                  },
                  '&::-webkit-outer-spin-button':{
                    '-webkit-appearance': 'none',
                    'margin': 0
                  },
                  /* Firefox */
                    '-moz-appearance': 'textfield'
                }
            });
        }),
        'prettier-plugin-tailwindcss',
    ],
};
