const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const PHP_PORT = process.env.PHP_PORT || 8899;
const publicDir = path.join(__dirname, 'public');

// public/api/*.php needs a real PHP process to execute; spawn PHP's built-in
// server on a local port and proxy /api requests to it, so `npm start` alone
// gives a fully working backend instead of requiring a separate PHP command.
const phpServer = spawn('php', ['-S', `127.0.0.1:${PHP_PORT}`, '-t', publicDir], {
  stdio: ['ignore', 'inherit', 'inherit'],
});
phpServer.on('error', (err) => {
  console.warn(`Could not start PHP (${err.message}); /api endpoints will return 502.`);
});

app.use('/api', (req, res) => {
  const proxyReq = http.request(
    { hostname: '127.0.0.1', port: PHP_PORT, path: req.originalUrl, method: req.method, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', () => res.status(502).json({ error: 'PHP backend is not available.' }));
  req.pipe(proxyReq);
});

app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Nova landing page running at http://localhost:${PORT}`);
});

const shutdown = () => {
  phpServer.kill();
  process.exit();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
