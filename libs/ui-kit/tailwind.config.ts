import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-default': 'var(--otv-color-bg-default)',
        'bg-elevated': 'var(--otv-color-bg-elevated)',
        'bg-overlay': 'var(--otv-color-bg-overlay)',
        'text-primary': 'var(--otv-color-text-primary)',
        'text-secondary': 'var(--otv-color-text-secondary)',
        'text-muted': 'var(--otv-color-text-muted)',
        'text-inverse': 'var(--otv-color-text-inverse)',
        'border-default': 'var(--otv-color-border-default)',
        'border-muted': 'var(--otv-color-border-muted)',
        primary: {
          base: 'var(--otv-color-primary-base)',
          hover: 'var(--otv-color-primary-hover)',
        },
        secondary: {
          base: 'var(--otv-color-secondary-base)',
        },
        error: {
          base: 'var(--otv-color-error-base)',
          bg: 'var(--otv-color-error-bg)',
        },
        warning: {
          base: 'var(--otv-color-warning-base)',
          bg: 'var(--otv-color-warning-bg)',
        },
        success: {
          base: 'var(--otv-color-success-base)',
          bg: 'var(--otv-color-success-bg)',
        },
        info: {
          base: 'var(--otv-color-info-base)',
          bg: 'var(--otv-color-info-bg)',
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
        xs: 'var(--otv-typography-font-size-xs)',
        sm: 'var(--otv-typography-font-size-sm)',
        base: 'var(--otv-typography-font-size-base)',
        lg: 'var(--otv-typography-font-size-lg)',
        xl: 'var(--otv-typography-font-size-xl)',
        '2xl': 'var(--otv-typography-font-size-2xl)',
        '3xl': 'var(--otv-typography-font-size-3xl)',
      },
      fontWeight: {
        normal: 'var(--otv-typography-font-weight-normal)',
        medium: 'var(--otv-typography-font-weight-medium)',
        semibold: 'var(--otv-typography-font-weight-semibold)',
        bold: 'var(--otv-typography-font-weight-bold)',
      },
      spacing: {
        '0.5': 'var(--otv-spacing-0-5)',
        '1.5': 'var(--otv-spacing-1-5)',
        '2.5': 'var(--otv-spacing-2-5)',
        '3.5': 'var(--otv-spacing-3-5)',
      },
      borderRadius: {
        sm: 'var(--otv-border-radius-sm)',
        DEFAULT: 'var(--otv-border-radius-DEFAULT)',
        md: 'var(--otv-border-radius-md)',
        lg: 'var(--otv-border-radius-lg)',
        xl: 'var(--otv-border-radius-xl)',
      },
      boxShadow: {
        sm: 'var(--otv-shadow-sm)',
        md: 'var(--otv-shadow-md)',
        lg: 'var(--otv-shadow-lg)',
        xl: 'var(--otv-shadow-xl)',
      },
    },
  },
  plugins: [],
}

export default config
