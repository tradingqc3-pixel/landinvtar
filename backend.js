/**
 * InvestLand Backend Terminal - Production Pulse
 * Port: 5000
 * Senior Backend Engineer Implementation
 */

// 1. Initialize environment parameters
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Logic Node Loading
let heroHandler;
try {
  heroHandler = require('./api/website/hero');
} catch (err) {
  console.error('[Startup Warning] Hero logic node inactive:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Global Middleware Stack
app.use(cors());
app.use(express.json());

// 3. Global Protocol Enforcement
// Ensures every response — even from mid-stream failures — is JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Request Logger for Synchronization Auditing
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] Handshake: ${req.method} ${req.url}`);
  next();
});

/**
 * Health Check Terminal
 * REQUIREMENT: Always returns JSON with online status and timestamp.
 */
app.get('/api/health', (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      status: "online",
      service: "InvestLand Backend",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    // Fail-safe JSON response
    return res.status(500).json({
      success: false,
      message: "Health check logic failure."
    });
  }
});

/**
 * Hero configuration terminal
 * Mapping internal logic to RESTful endpoints
 */
if (heroHandler) {
  app.get('/api/hero', async (req, res, next) => {
    try {
      await heroHandler(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/hero', async (req, res, next) => {
    try {
      await heroHandler(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/hero/:id', async (req, res, next) => {
    try {
      req.query.id = req.params.id;
      await heroHandler(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/hero/:id', async (req, res, next) => {
    try {
      req.query.id = req.params.id;
      req.method = 'DELETE';
      await heroHandler(req, res);
    } catch (error) {
      next(error);
    }
  });
}

/**
 * Root Protocol
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'InvestLand Backend Terminal is Online',
    timestamp: new Date().toISOString()
  });
});

/**
 * Hardened 404 handler for /api path
 */
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Terminal path [${req.method}] ${req.url} not found.`
  });
});

/**
 * Global JSON Error Shield
 * REQUIREMENT: Replace plain-text errors with structured JSON.
 */
app.use((err, req, res, next) => {
  console.error('[System Sync Error]:', err);

  // Ensure headers are sent as JSON
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal system synchronization failure."
  });
});

/**
 * Pulse Activation
 * REQUIREMENT: Explicit binding to 127.0.0.1:5000
 */
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\x1b[32m[InvestLand Backend] ACTIVE on http://127.0.0.1:${PORT}\x1b[0m`);
  console.log(`[HANDSHAKE] Verification terminal available at /api/health`);
});
