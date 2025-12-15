const express = require('express');
const promClient = require('prom-client');
const path = require('path');

// Default metrics (always available)
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom counter
const requests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(requests);

const app = express();

// Serve static files FIRST
app.use(express.static(path.join(__dirname, 'build')));

// Track requests
app.use((req, res, next) => {
  res.on('finish', () => {
    requests.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await register.metrics());
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
