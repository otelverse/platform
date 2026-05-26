const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const express = require('express');

const collectorUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';

const provider = new NodeTracerProvider();
const exporter = new OTLPTraceExporter({ url: collectorUrl });
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

const tracer = opentelemetry.trace.getTracer('sample-app');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  const span = tracer.startSpan('home-request');
  span.setAttribute('http.method', 'GET');
  span.setAttribute('http.route', '/');
  res.json({ message: 'Hello from OTelVerse Sample App!', timestamp: new Date().toISOString() });
  span.end();
});

app.get('/api/items', (req, res) => {
  const span = tracer.startSpan('list-items');
  span.setAttribute('http.method', 'GET');
  const items = [
    { id: 1, name: 'Trace', description: 'A distributed trace' },
    { id: 2, name: 'Span', description: 'A single operation within a trace' },
    { id: 3, name: 'Metric', description: 'A measured value over time' },
  ];
  res.json(items);
  span.end();
});

app.get('/api/error', (req, res) => {
  const span = tracer.startSpan('error-request');
  span.setAttribute('error', true);
  span.setAttribute('http.status_code', 500);
  res.status(500).json({ error: 'Simulated error for testing' });
  span.end();
});

app.listen(PORT, () => {
  console.log(`Sample app listening on http://localhost:${PORT}`);
  console.log(`Sending traces to ${collectorUrl}`);
});
