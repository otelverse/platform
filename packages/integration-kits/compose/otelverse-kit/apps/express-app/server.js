const express = require('express');
const cors = require('cors');
const { trace, context } = require('@opentelemetry/api');

const app = express();
app.use(cors());
app.use(express.json());

const tracer = trace.getTracer('express-app');

// Mock data
const users = [{ id: 1, email: 'alice@example.com' }, { id: 2, email: 'bob@example.com' }];

app.get('/users', (req, res) => {
  tracer.startActiveSpan('fetch-users', (span) => {
    span.setAttribute('user.count', users.length);
    res.json(users);
    span.end();
  });
});

app.post('/orders', (req, res) => {
  tracer.startActiveSpan('process-order', (span) => {
    const order = req.body;
    span.setAttribute('order.id', order.id || 'unknown');
    
    // Simulate some logic
    setTimeout(() => {
      if (order.fail) {
        span.recordException(new Error('Order processing failed'));
        span.setStatus({ code: 2, message: 'Processing failed' }); // Error status
        res.status(500).json({ error: 'Processing failed' });
      } else {
        res.json({ status: 'success', id: order.id });
      }
      span.end();
    }, 100);
  });
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT}`);
});
