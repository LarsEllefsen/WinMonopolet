const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		screens: {
			xs: '475px',
			...defaultTheme.screens
		},
		extend: {
			colors: {
				untappd: {
					DEFAULT: '#ffc000'
				},
				wmp: {
					light: '#5A65E4',
					DEFAULT: '#3e4cdf',
					dark: '#2231D3',
					darker: '#1D29AF'
				},
				'ida-blue': {
					DEFAULT: '#b3caff',
					opacity: 'rgba(179, 202, 255, 0.7)'
				}
			},
			boxShadow: {
				box: '4px 4px',
				'box-md': '6px 6px',
				border: '0px 1px'
			},
			ringColor: {
				DEFAULT: '#3e4cdf'
			}
		}
	},
	plugins: [require('tailwind-hamburgers')]
};
