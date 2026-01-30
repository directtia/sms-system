import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (Dark theme)
        bg: {
          primary: '#0F172A',    // slate-900 (main background)
          secondary: '#1E293B',  // slate-800 (cards)
          tertiary: '#334155',   // slate-700 (hover)
        },
        brand: {
          primary: '#14B8A6',    // teal-500 (main action)
          secondary: '#06B6D4',  // cyan-500 (secondary)
          accent: '#FB923C',     // orange-400 (urgent/offers)
        },
        semantic: {
          success: '#10B981',    // emerald-500 (delivered)
          warning: '#FCD34D',    // amber-300 (pending)
          danger: '#EF4444',     // red-500 (failed)
          info: '#93C5FD',       // blue-300 (info)
        },
        // Legacy compatibility
        primary: '#14B8A6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#FCD34D',
        neutral: '#64748B',
      },
      textColor: {
        primary: '#FFFFFF',      // white (titles)
        secondary: '#E2E8F0',    // slate-200 (body)
        tertiary: '#CBD5E1',     // slate-300 (secondary)
        muted: '#64748B',        // slate-500 (disabled)
      },
    },
  },
  plugins: [],
}
export default config
