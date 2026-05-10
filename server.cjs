const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the built dist folder
app.use(
  express.static(path.join(__dirname, 'dist'), {
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

// SPA fallback — all routes serve index.html
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Explicitly bind to 0.0.0.0 so Railway's load balancer can reach us
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SuperBot Dashboard running on http://0.0.0.0:${PORT}`);
});
