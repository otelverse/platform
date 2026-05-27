import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  BasicTracerProvider,
} from '@opentelemetry/sdk-trace-base'

describe('full lifecycle integration', () => {
  let exporter: InMemorySpanExporter
  let tracerProvider: BasicTracerProvider

  beforeEach(() => {
    exporter = new InMemorySpanExporter()
    tracerProvider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    })
  })

  afterEach(() => {
    exporter.reset()
  })

  it('creates and exports manual spans', () => {
    const tracer = tracerProvider.getTracer('integration-test')
    const span = tracer.startSpan('manual-span', {
      attributes: { key: 'value' },
    })
    span.addEvent('event1', { attr: 'val' })
    span.end()

    const spans = exporter.getFinishedSpans()
    expect(spans.length).toBe(1)
    expect(spans[0].name).toBe('manual-span')
    expect(spans[0].attributes['key']).toBe('value')
  })

  it('records exceptions on spans', () => {
    const tracer = tracerProvider.getTracer('integration-test')
    const error = new Error('test error')
    const span = tracer.startSpan('error-span')
    span.recordException(error)
    span.setStatus({ code: 2, message: error.message })
    span.end()

    const spans = exporter.getFinishedSpans()
    expect(spans.length).toBe(1)
    expect(spans[0].status.code).toBe(2)
    expect(spans[0].status.message).toBe('test error')
  })
})
