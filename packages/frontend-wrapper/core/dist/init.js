import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes, defaultResource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { metrics } from '@opentelemetry/api';
import { getSessionId } from './session';
import { trackWebVitals } from './vitals';
import { setupErrorTracking } from './errors';
let initialized = false;
export function initOtel(config) {
    if (initialized) {
        return { shutdown: async () => { } };
    }
    initialized = true;
    const collectorUrl = config?.collectorUrl ?? 'http://localhost:4318';
    const serviceName = config?.serviceName ?? 'web';
    const sessionId = getSessionId();
    const resource = defaultResource().merge(resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        'session.id': sessionId,
    }));
    const traceExporter = new OTLPTraceExporter({
        url: `${collectorUrl}/v1/traces`,
    });
    const traceProvider = new WebTracerProvider({
        resource,
        spanProcessors: [new BatchSpanProcessor(traceExporter)],
    });
    traceProvider.register();
    const metricExporter = new OTLPMetricExporter({
        url: `${collectorUrl}/v1/metrics`,
    });
    const meterProvider = new MeterProvider({
        resource,
        readers: [
            new PeriodicExportingMetricReader({
                exporter: metricExporter,
                exportIntervalMillis: 5000,
            }),
        ],
    });
    metrics.setGlobalMeterProvider(meterProvider);
    registerInstrumentations({
        tracerProvider: traceProvider,
        instrumentations: [
            new DocumentLoadInstrumentation(),
            new FetchInstrumentation(),
            new XMLHttpRequestInstrumentation(),
        ],
    });
    const meter = meterProvider.getMeter('otelverse-web');
    trackWebVitals(meter);
    setupErrorTracking(traceProvider);
    return {
        shutdown: async () => {
            await traceProvider.shutdown();
            await meterProvider.shutdown();
        },
    };
}
//# sourceMappingURL=init.js.map