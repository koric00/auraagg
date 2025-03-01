const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { createClient } = require('redis');
const logger = require('./utils/logger');
const config = require('./config');

// Import routes
const quoteRoutes = require('./routes/quote');
const statusRoutes = require('./routes/status');
const txRoutes = require('./routes/transaction');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuraAgg API',
      version: '0.1.0',
      description: 'API for AuraAgg DEX aggregator',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/v1/quote', quoteRoutes);
app.use('/api/v1/status', statusRoutes);
app.use('/api/v1/tx', txRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  logger.info('Client connected to WebSocket');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.info(`Received WebSocket message: ${JSON.stringify(data)}`);
      
      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          handleSubscription(ws, data);
          break;
        case 'unsubscribe':
          handleUnsubscription(ws, data);
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
      }
    } catch (error) {
      logger.error(`WebSocket error: ${error.message}`);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    logger.info('Client disconnected from WebSocket');
  });
  
  // Send welcome message
  ws.send(JSON.stringify({ type: 'info', message: 'Connected to AuraAgg WebSocket server' }));
});

// Initialize Redis client
const redisClient = createClient({
  url: config.redis.url,
});

redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

// Connect to Redis
(async () => {
  await redisClient.connect();
  logger.info('Connected to Redis');
  
  // Start the server
  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Swagger documentation available at http://localhost:${config.port}/api-docs`);
  });
})();

// Handle WebSocket subscriptions
function handleSubscription(ws, data) {
  const { channel, params } = data;
  logger.info(`Client subscribed to channel: ${channel}`);
  
  // Store subscription info in the WebSocket object
  ws.subscriptions = ws.subscriptions || {};
  ws.subscriptions[channel] = params;
  
  // Acknowledge subscription
  ws.send(JSON.stringify({
    type: 'subscribed',
    channel,
    params,
  }));
  
  // Setup Redis subscription if needed
  if (channel === 'price_updates') {
    setupPriceUpdates(ws, params);
  } else if (channel === 'tx_updates') {
    setupTxUpdates(ws, params);
  }
}

// Handle WebSocket unsubscriptions
function handleUnsubscription(ws, data) {
  const { channel } = data;
  
  if (ws.subscriptions && ws.subscriptions[channel]) {
    delete ws.subscriptions[channel];
    logger.info(`Client unsubscribed from channel: ${channel}`);
    
    // Acknowledge unsubscription
    ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
    }));
  }
}

// Setup price updates subscription
function setupPriceUpdates(ws, params) {
  const { tokens } = params;
  
  if (!tokens || !Array.isArray(tokens)) {
    ws.send(JSON.stringify({ error: 'Invalid tokens parameter' }));
    return;
  }
  
  // Subscribe to Redis channels for price updates
  const redisSubscriber = redisClient.duplicate();
  
  (async () => {
    await redisSubscriber.connect();
    
    for (const token of tokens) {
      await redisSubscriber.subscribe(`price:${token}`, (message) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'price_update',
            token,
            data: JSON.parse(message),
          }));
        }
      });
    }
  })();
  
  // Store the subscriber in the WebSocket object for cleanup
  ws.redisSubscriber = redisSubscriber;
  
  // Clean up on close
  ws.on('close', () => {
    if (ws.redisSubscriber) {
      ws.redisSubscriber.quit();
    }
  });
}

// Setup transaction updates subscription
function setupTxUpdates(ws, params) {
  const { chainId, address } = params;
  
  if (!chainId || !address) {
    ws.send(JSON.stringify({ error: 'Invalid parameters for tx_updates' }));
    return;
  }
  
  // Subscribe to Redis channel for transaction updates
  const redisSubscriber = redisClient.duplicate();
  
  (async () => {
    await redisSubscriber.connect();
    
    await redisSubscriber.subscribe(`tx:${chainId}:${address}`, (message) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'tx_update',
          chainId,
          address,
          data: JSON.parse(message),
        }));
      }
    });
  })();
  
  // Store the subscriber in the WebSocket object for cleanup
  ws.redisSubscriber = redisSubscriber;
  
  // Clean up on close
  ws.on('close', () => {
    if (ws.redisSubscriber) {
      ws.redisSubscriber.quit();
    }
  });
}

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Shutting down gracefully...');
  
  // Close WebSocket server
  wss.clients.forEach((client) => {
    client.terminate();
  });
  
  // Close Redis connection
  await redisClient.quit();
  
  // Close HTTP server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
} 