/**
 * tailwind.config.js
 *
 * Purpose: Tailwind CSS v3 configuration for Family Cashflow
 * Context: Scoped to src directory — purges unused styles on build
 * Dependencies: tailwindcss@3
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Purge unused CSS in production — only scan src files
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  theme: {
    extend: {
      colors: {
        // Primary green — income/positive indicators
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Red — expense/negative indicators
        expense: {
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        // Clean sans-serif for financial data readability
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      }
    },
  },

  plugins: [],
}