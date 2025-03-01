const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const logger = require('./utils/logger');

// Import routes
const quoteRoutes = require('./routes/quote');
const swapRoutes = require('./routes/swap');
const crosschainRoutes = require('./routes/crosschain');

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});
app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuraAgg API',
      version: '1.0.0',
      description: 'AuraAgg API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@auraagg.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server'
      },
      {
        url: 'https://api.auraagg.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header'
        }
      }
    },
    security: [
      {
        apiKey: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API key middleware
app.use((req, res, next) => {
  // Skip API key check for documentation
  if (req.path.startsWith('/api-docs')) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  
  // In development mode, allow requests without API key
  if (process.env.NODE_ENV === 'development' && !config.server.requireApiKeyInDev) {
    return next();
  }

  if (!apiKey || !config.apiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
});

// Routes
app.use('/api/v1/quote', quoteRoutes);
app.use('/api/v1/swap', swapRoutes);
app.use('/api/v1/crosschain', crosschainRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Don't leak error details in production
  const error = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
  
  res.status(err.status || 500).json({
    error,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

module.exports = app; 