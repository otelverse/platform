import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  usePipelines,
  usePipeline,
  useCreatePipeline,
  useDeletePipeline,
} from '../usePipelines'

const mockRequest = jest.fn()

jest.mock('../../client', () => ({
  gqlRequest: (...args: unknown[]) => mockRequest(...args),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => {
  mockRequest.mockReset()
})

describe('usePipelines', () => {
  it('fetches pipelines list', async () => {
    const pipelines = [
      { id: 'p1', name: 'Test Pipeline', nodes: [], edges: [] },
    ]
    mockRequest.mockResolvedValue({ pipelines })

    const { result } = renderHook(() => usePipelines(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pipelines).toEqual(pipelines)
  })
})

describe('usePipeline', () => {
  it('fetches pipeline by id', async () => {
    const pipeline = { id: 'p1', name: 'Test', nodes: [], edges: [] }
    mockRequest.mockResolvedValue({ pipeline })

    const { result } = renderHook(() => usePipeline('p1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pipeline).toEqual(pipeline)
  })

  it('does not fetch when id is null', async () => {
    const { result } = renderHook(() => usePipeline(null), { wrapper })

    expect(mockRequest).not.toHaveBeenCalled()
  })
})

describe('useCreatePipeline', () => {
  it('creates a pipeline', async () => {
    const created = { id: 'new', name: 'New Pipeline' }
    mockRequest.mockResolvedValue({ pipelineCreate: created })

    const { result } = renderHook(() => useCreatePipeline(), { wrapper })

    result.current.mutate({
      input: { name: 'New Pipeline', nodes: [], edges: [] },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pipelineCreate).toEqual(created)
  })
})

describe('useDeletePipeline', () => {
  it('deletes a pipeline', async () => {
    mockRequest.mockResolvedValue({ pipelineDelete: true })

    const { result } = renderHook(() => useDeletePipeline(), { wrapper })

    result.current.mutate({ id: 'p1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pipelineDelete).toBe(true)
  })
})
