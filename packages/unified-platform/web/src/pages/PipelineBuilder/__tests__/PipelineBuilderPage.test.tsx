import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@otelverse/ui-kit'
import PipelineBuilderPage from '../PipelineBuilderPage'

const mockMutate = jest.fn()

jest.mock('@otelverse/api-hooks', () => {
  const actual = jest.requireActual('@otelverse/api-hooks')
  return {
    ...actual,
    usePipelines: () => ({
      data: { pipelines: [{ id: 'p1', name: 'Test Pipeline', nodes: [], edges: [] }] },
      isLoading: false,
    }),
    usePipeline: (id: string | null) => ({
      data: id ? { pipeline: { id: 'p1', name: 'Test Pipeline', nodes: [], edges: [] } } : undefined,
      isLoading: false,
    }),
    useCreatePipeline: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
    useUpdatePipeline: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
    useDeletePipeline: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
    useValidatePipeline: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
    useExportPipelineYAML: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
    useDeployPipeline: () => ({
      mutate: mockMutate,
      isPending: false,
    }),
  }
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('PipelineBuilderPage', () => {
  it('renders pipeline list', () => {
    render(<PipelineBuilderPage />, { wrapper })
    expect(screen.getByText('Pipelines')).toBeInTheDocument()
    expect(screen.getByText('Test Pipeline')).toBeInTheDocument()
  })

  it('shows create button', () => {
    render(<PipelineBuilderPage />, { wrapper })
    expect(screen.getByText('+ New')).toBeInTheDocument()
  })

  it('shows empty state when no pipeline selected', () => {
    render(<PipelineBuilderPage />, { wrapper })
    expect(screen.getByText('Select or create a pipeline to start editing')).toBeInTheDocument()
  })

  it('shows toolbar buttons', () => {
    render(<PipelineBuilderPage />, { wrapper })
    expect(screen.getByText('Validate')).toBeInTheDocument()
    expect(screen.getByText('Export YAML')).toBeInTheDocument()
    expect(screen.getByText('Deploy')).toBeInTheDocument()
  })

  it('selects pipeline on click', () => {
    render(<PipelineBuilderPage />, { wrapper })
    fireEvent.click(screen.getByText('Test Pipeline'))
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls create mutation on new button click', () => {
    render(<PipelineBuilderPage />, { wrapper })
    fireEvent.click(screen.getByText('+ New'))
    expect(mockMutate).toHaveBeenCalled()
  })
})
