// src/init.ts
import { WebTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { resourceFromAttributes, defaultResource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { metrics } from "@opentelemetry/api";

// src/session.ts
var SESSION_STORAGE_KEY = "otelverse_session_id";
function generateUUID() {
  const chars = "0123456789abcdef";
  const sections = [8, 4, 4, 4, 12];
  return sections.map((len) => {
    let section = "";
    for (let i = 0; i < len; i++) {
      section += chars[Math.floor(Math.random() * 16)];
    }
    return section;
  }).join("-");
}
var cachedSessionId = null;
function getSessionId() {
  if (cachedSessionId) return cachedSessionId;
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      cachedSessionId = stored;
      return cachedSessionId;
    }
  } catch {
  }
  cachedSessionId = generateUUID();
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, cachedSessionId);
  } catch {
  }
  return cachedSessionId;
}

// src/vitals.ts
import { onLCP, onCLS, onFCP, onTTFB, onINP } from "web-vitals";
function trackWebVitals(meter) {
  const lcpHistogram = meter.createHistogram("webvitals.lcp", {
    description: "Largest Contentful Paint",
    unit: "ms"
  });
  const clsGauge = meter.createGauge("webvitals.cls", {
    description: "Cumulative Layout Shift",
    unit: "1"
  });
  const fcpHistogram = meter.createHistogram("webvitals.fcp", {
    description: "First Contentful Paint",
    unit: "ms"
  });
  const ttfbHistogram = meter.createHistogram("webvitals.ttfb", {
    description: "Time to First Byte",
    unit: "ms"
  });
  const inpHistogram = meter.createHistogram("webvitals.inp", {
    description: "Interaction to Next Paint",
    unit: "ms"
  });
  onLCP((metric) => {
    lcpHistogram.record(metric.value);
  });
  onCLS((metric) => {
    clsGauge.record(metric.value);
  });
  onFCP((metric) => {
    fcpHistogram.record(metric.value);
  });
  onTTFB((metric) => {
    ttfbHistogram.record(metric.value);
  });
  onINP((metric) => {
    inpHistogram.record(metric.value);
  });
}

// src/errors.ts
import { SpanStatusCode } from "@opentelemetry/api";
function setupErrorTracking(tracerProvider) {
  const tracer = tracerProvider.getTracer("otelverse-web");
  window.addEventListener("error", (event) => {
    const span = tracer.startSpan("window.error", {
      attributes: {
        "error.type": event.type,
        "error.message": event.message,
        "error.filename": event.filename,
        "error.lineno": event.lineno,
        "error.colno": event.colno
      }
    });
    span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
    span.end();
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    const span = tracer.startSpan("window.unhandledrejection", {
      attributes: {
        "error.type": "unhandledrejection",
        "error.message": reason
      }
    });
    span.setStatus({ code: SpanStatusCode.ERROR, message: reason });
    span.end();
  });
}

// src/init.ts
var initialized = false;
function initOtel(config) {
  if (initialized) {
    return { shutdown: async () => {
    } };
  }
  initialized = true;
  const collectorUrl = config?.collectorUrl ?? "http://localhost:4318";
  const serviceName = config?.serviceName ?? "web";
  const sessionId = getSessionId();
  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      "session.id": sessionId
    })
  );
  const traceExporter = new OTLPTraceExporter({
    url: `${collectorUrl}/v1/traces`
  });
  const traceProvider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)]
  });
  traceProvider.register();
  const metricExporter = new OTLPMetricExporter({
    url: `${collectorUrl}/v1/metrics`
  });
  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 5e3
      })
    ]
  });
  metrics.setGlobalMeterProvider(meterProvider);
  registerInstrumentations({
    tracerProvider: traceProvider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation(),
      new XMLHttpRequestInstrumentation()
    ]
  });
  const meter = meterProvider.getMeter("otelverse-web");
  trackWebVitals(meter);
  setupErrorTracking(traceProvider);
  return {
    shutdown: async () => {
      await traceProvider.shutdown();
      await meterProvider.shutdown();
    }
  };
}
export {
  getSessionId,
  initOtel
};
//# sourceMappingURL=otelverse-web.js.map
