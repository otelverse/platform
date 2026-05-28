import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]">
          <div className="w-16 h-16 mb-4 text-[var(--color-text-danger)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">Something went wrong</h2>
          <p className="mb-6 text-[var(--color-text-secondary)] text-center max-w-md">
            We're sorry, but an unexpected error occurred while rendering this component.
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 font-medium text-white bg-[var(--color-brand-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-brand-primary-hover)] transition-colors"
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
