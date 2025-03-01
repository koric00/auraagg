# AuraAgg API Service

The AuraAgg API Service provides endpoints for token swapping, cross-chain swapping, and price quotes.

## Features

- Token swap quotes and execution
- Cross-chain swap quotes and execution
- Token price information
- Transaction status tracking
- Swagger API documentation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Redis (for caching and rate limiting)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/auraagg.git
cd auraagg/api
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Server
PORT=3000
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API Keys
API_KEYS=your-api-key-1,your-api-key-2

# RPC Endpoints
ETH_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Contract Addresses
ROUTER_CONTRACT_ETH=0x...
ROUTER_CONTRACT_ARBITRUM=0x...
ROUTER_CONTRACT_OPTIMISM=0x...
ROUTER_CONTRACT_POLYGON=0x...

# External APIs
COINGECKO_API_KEY=your-coingecko-api-key
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Quote

- `POST /api/v1/quote` - Get quote for token swap
- `GET /api/v1/quote/price` - Get token price

### Swap

- `POST /api/v1/swap` - Execute a token swap
- `GET /api/v1/swap/status/:txHash` - Get swap transaction status

### Cross-Chain

- `POST /api/v1/crosschain/quote` - Get quote for cross-chain token swap
- `POST /api/v1/crosschain/swap` - Execute a cross-chain token swap
- `GET /api/v1/crosschain/status/:bridgeId` - Get cross-chain transaction status

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 