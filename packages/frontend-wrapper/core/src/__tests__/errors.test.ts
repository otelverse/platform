import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { setupErrorTracking } from '../errors'

describe('error tracking', () => {
  let exporter: InMemorySpanExporter
  let tracerProvider: WebTracerProvider

  beforeEach(() => {
    exporter = new InMemorySpanExporter()
    tracerProvider = new WebTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    })
  })

  afterEach(() => {
    exporter.reset()
  })

  it('creates an error span on window error', () => {
    setupErrorTracking(tracerProvider)
    const event = new ErrorEvent('error', {
      message: 'test error',
      filename: 'test.js',
      lineno: 10,
      colno: 5,
    })
    window.dispatchEvent(event)

    const spans = exporter.getFinishedSpans()
    expect(spans.length).toBe(1)
    expect(spans[0].name).toBe('window.error')
    expect(spans[0].attributes['error.message']).toBe('test error')
    expect(spans[0].status.code).toBe(2)
  })

  it('listens for unhandledrejection events', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    setupErrorTracking(tracerProvider)
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function),
    )
  })
})
