/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                /* Brutalist futuristic palette */
                'beet-green': '#00FF88',   /* acid green — primary */
                'beet-cyan': '#00E5FF',   /* electric cyan — industry */
                'beet-purple': '#7000FF',   /* ultraviolet */
                'beet-red': '#FF0055',   /* hot red/pink */
                'beet-yellow': '#FFE600',   /* hard yellow */
                /* Base */
                'beet-black': '#080812',
                'beet-dark': '#101026',
                'beet-card': 'rgba(20, 20, 35, 0.8)',
                'beet-border': 'rgba(255,255,255,0.15)',
                'beet-muted': '#6B6B83',
                'beet-gray': '#E4E4F0',
                /* Blue alias */
                'beet-blue': '#00E5FF',
                'beet-blue-light': '#80F3FF',
            },
            fontFamily: {
                sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Syne', 'Outfit', 'Inter', 'sans-serif'],
                condensed: ['Barlow Condensed', 'Impact', 'sans-serif'],
                mono: ['Space Mono', 'JetBrains Mono', 'Courier New', 'monospace'],
                outfit: ['Outfit', 'sans-serif'],
            },
            fontSize: {
                /* Micro labels — Space Mono */
                'label-xs': ['0.5625rem', { lineHeight: '1', letterSpacing: '0.18em' }],
                'label-sm': ['0.625rem', { lineHeight: '1', letterSpacing: '0.14em' }],
                'label-md': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em' }],
                'label-lg': ['0.75rem', { lineHeight: '1', letterSpacing: '0.14em' }],
                'label-xl': ['0.875rem', { lineHeight: '1', letterSpacing: '0.14em' }],
                /* Body */
                'body-xs': ['0.875rem', { lineHeight: '1.55' }],
                'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
                'body': ['1rem', { lineHeight: '1.65' }],
                'body-lg': ['1.125rem', { lineHeight: '1.7' }],
                /* Headings */
                'h6': ['0.75rem', { lineHeight: '1', letterSpacing: '0.15em' }],
                'h5': ['1.125rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
                'h4': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
                'h3': ['1.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'h2': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
                'h1': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
                /* Display */
                'display-sm': ['3rem', { lineHeight: '0.94', letterSpacing: '-0.03em' }],
                'display': ['5rem', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
                'display-lg': ['7rem', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
                'display-xl': ['9rem', { lineHeight: '0.85', letterSpacing: '-0.05em' }],
                /* Stats */
                'stat-sm': ['1.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
                'stat': ['2.5rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
                'stat-lg': ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
            },
            borderRadius: {
                DEFAULT: '2px',   /* brutalist: near-zero radius everywhere */
                'none': '0px',
                'sm': '2px',
                'md': '4px',
                'lg': '4px',
                'xl': '6px',
                '2xl': '8px',
                '3xl': '8px',
                'full': '9999px',
            },
            animation: {
                'neon-flicker': 'neon-flicker 5s ease infinite',
                'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
                'float': 'float-y 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.3s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'shimmer': 'shimmer 1.4s ease infinite',
                'glitch-top': 'glitch-top 3s ease-in-out infinite',
                'glitch-bot': 'glitch-bot 3s ease-in-out infinite',
            },
            keyframes: {
                'neon-flicker': {
                    '0%, 100%': { opacity: '1' },
                    '93%': { opacity: '0.5' },
                    '94%': { opacity: '1' },
                    '96%': { opacity: '0.8' },
                    '97%': { opacity: '1' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 6px rgba(0,255,136,0.4)' },
                    '50%': { boxShadow: '0 0 24px rgba(0,255,136,0.6), 0 0 48px rgba(0,255,136,0.2)' },
                },
                'float-y': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'slide-up': {
                    from: { transform: 'translateY(16px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
            },
            backgroundImage: {
                'glow-artist': 'radial-gradient(ellipse at 50% 120%, rgba(0,255,136,0.15) 0%, transparent 70%)',
                'glow-industry': 'radial-gradient(ellipse at 50% 120%, rgba(0,229,255,0.15) 0%, transparent 70%)',
                'grid-dots': 'radial-gradient(rgba(0,255,136,0.15) 1px, transparent 1px)',
                'grid-lines': 'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
            },
            boxShadow: {
                'neon': '0 0 16px rgba(0,255,136,0.45), 0 0 48px rgba(0,255,136,0.15)',
                'brutal': '4px 4px 0 #00FF88',
                'brutal-red': '4px 4px 0 #FF0055',
                'brutal-cyan': '4px 4px 0 #00E5FF',
                'card': '0 4px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
            },
        },
    },
    plugins: [],
};
