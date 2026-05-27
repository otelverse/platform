import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-default': 'var(--color-bg-default)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-overlay': 'var(--color-bg-overlay)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverse': 'var(--color-text-inverse)',
        'border-default': 'var(--color-border-default)',
        'border-muted': 'var(--color-border-muted)',
        primary: {
          base: 'var(--color-primary-base)',
          hover: 'var(--color-primary-hover)',
        },
        secondary: {
          base: 'var(--color-secondary-base)',
        },
        error: {
          base: 'var(--color-error-base)',
          bg: 'var(--color-error-bg)',
        },
        warning: {
          base: 'var(--color-warning-base)',
          bg: 'var(--color-warning-bg)',
        },
        success: {
          base: 'var(--color-success-base)',
          bg: 'var(--color-success-bg)',
        },
        info: {
          base: 'var(--color-info-base)',
          bg: 'var(--color-info-bg)',
        },
      },
      fontFamily: {
        ui: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        code: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      fontSize: {
        xs: 'var(--typography-font-size-xs)',
        sm: 'var(--typography-font-size-sm)',
        base: 'var(--typography-font-size-base)',
        lg: 'var(--typography-font-size-lg)',
        xl: 'var(--typography-font-size-xl)',
        '2xl': 'var(--typography-font-size-2xl)',
        '3xl': 'var(--typography-font-size-3xl)',
      },
      fontWeight: {
        normal: 'var(--typography-font-weight-normal)',
        medium: 'var(--typography-font-weight-medium)',
        semibold: 'var(--typography-font-weight-semibold)',
        bold: 'var(--typography-font-weight-bold)',
      },
      borderRadius: {
        sm: 'var(--border-radius-sm)',
        DEFAULT: 'var(--border-radius-default)',
        md: 'var(--border-radius-md)',
        lg: 'var(--border-radius-lg)',
        xl: 'var(--border-radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
  plugins: [],
}

export default config
