jest.mock('@opentelemetry/instrumentation-fetch', () => ({
  FetchInstrumentation: jest.fn().mockImplementation(() => ({
    setTracerProvider: jest.fn(),
    setMeterProvider: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
  })),
}))

jest.mock('@opentelemetry/instrumentation-xml-http-request', () => ({
  XMLHttpRequestInstrumentation: jest.fn().mockImplementation(() => ({
    setTracerProvider: jest.fn(),
    setMeterProvider: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
  })),
}))

jest.mock('@opentelemetry/instrumentation-document-load', () => ({
  DocumentLoadInstrumentation: jest.fn().mockImplementation(() => ({
    setTracerProvider: jest.fn(),
    setMeterProvider: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
  })),
}))

jest.mock('@opentelemetry/instrumentation', () => ({
  registerInstrumentations: jest.fn(),
}))

jest.mock('web-vitals', () => ({
  onLCP: jest.fn(),
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onTTFB: jest.fn(),
  onINP: jest.fn(),
}))

import { initOtel } from '../init'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('initOtel', () => {
  it('returns an OtelInstance with shutdown function', () => {
    const instance = initOtel({ collectorUrl: 'http://localhost:4318' })
    expect(instance).toBeDefined()
    expect(typeof instance.shutdown).toBe('function')
  })

  it('handles multiple calls gracefully (no double init)', () => {
    const instance1 = initOtel()
    const instance2 = initOtel()
    expect(instance1).toBeDefined()
    expect(instance2).toBeDefined()
  })
})
