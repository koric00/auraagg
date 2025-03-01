require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    requireApiKeyInDev: process.env.REQUIRE_API_KEY_IN_DEV === 'true'
  },
  env: process.env.NODE_ENV || 'development',
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    prefix: process.env.REDIS_PREFIX || 'auraagg:'
  },
  
  // API Keys
  apiKeys: (process.env.API_KEYS || '').split(',').filter(Boolean),
  
  // Blockchain RPC endpoints
  rpc: {
    ethereum: {
      mainnet: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-api-key',
      goerli: process.env.ETH_GOERLI_RPC || 'https://goerli.infura.io/v3/your-api-key',
      sepolia: process.env.ETH_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/your-api-key',
    },
    arbitrum: {
      mainnet: process.env.ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/your-api-key',
      goerli: process.env.ARB_GOERLI_RPC || 'https://arb-goerli.g.alchemy.com/v2/your-api-key',
    },
    optimism: {
      mainnet: process.env.OPTIMISM_RPC_URL || 'https://opt-mainnet.g.alchemy.com/v2/your-api-key',
      goerli: process.env.OPT_GOERLI_RPC || 'https://opt-goerli.g.alchemy.com/v2/your-api-key',
    },
    polygon: {
      mainnet: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
      mumbai: process.env.POLYGON_MUMBAI_RPC || 'https://polygon-mumbai.g.alchemy.com/v2/your-api-key',
    },
    solana: {
      mainnet: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      devnet: process.env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
    },
  },
  
  // Contract addresses
  contracts: {
    ethereum: {
      router: process.env.ROUTER_CONTRACT_ETH || '0x0000000000000000000000000000000000000000',
      crossChainSwap: process.env.ETH_CROSS_CHAIN_SWAP_ADDRESS || '0x0000000000000000000000000000000000000000',
    },
    arbitrum: {
      router: process.env.ROUTER_CONTRACT_ARBITRUM || '0x0000000000000000000000000000000000000000',
      crossChainSwap: process.env.ARB_CROSS_CHAIN_SWAP_ADDRESS || '0x0000000000000000000000000000000000000000',
    },
    optimism: {
      router: process.env.ROUTER_CONTRACT_OPTIMISM || '0x0000000000000000000000000000000000000000',
      crossChainSwap: process.env.OPT_CROSS_CHAIN_SWAP_ADDRESS || '0x0000000000000000000000000000000000000000',
    },
    polygon: {
      router: process.env.ROUTER_CONTRACT_POLYGON || '0x0000000000000000000000000000000000000000',
      crossChainSwap: process.env.POLYGON_CROSS_CHAIN_SWAP_ADDRESS || '0x0000000000000000000000000000000000000000',
    },
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: parseInt(process.env.LOG_FILE_MAX_SIZE || '5242880', 10),
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP to 100 requests per windowMs
  },
  
  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '60', 10), // seconds
  },
};

module.exports = config; 