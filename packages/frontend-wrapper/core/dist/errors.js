import { SpanStatusCode } from '@opentelemetry/api';
export function setupErrorTracking(tracerProvider) {
    const tracer = tracerProvider.getTracer('otelverse-web');
    window.addEventListener('error', (event) => {
        const span = tracer.startSpan('window.error', {
            attributes: {
                'error.type': event.type,
                'error.message': event.message,
                'error.filename': event.filename,
                'error.lineno': event.lineno,
                'error.colno': event.colno,
            },
        });
        span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
        span.end();
    });
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
        const span = tracer.startSpan('window.unhandledrejection', {
            attributes: {
                'error.type': 'unhandledrejection',
                'error.message': reason,
            },
        });
        span.setStatus({ code: SpanStatusCode.ERROR, message: reason });
        span.end();
    });
}
//# sourceMappingURL=errors.js.map