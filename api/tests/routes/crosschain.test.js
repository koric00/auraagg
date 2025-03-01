const request = require('supertest');
const app = require('../../src/app');

describe('CrossChain Routes', () => {
  describe('POST /api/v1/crosschain/quote', () => {
    it('should return a quote for valid input', async () => {
      const response = await request(app)
        .post('/api/v1/crosschain/quote')
        .send({
          sourceChainId: 1, // Ethereum
          destinationChainId: 42161, // Arbitrum
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH on Ethereum
          outputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
          amountIn: '1000000000000000000', // 1 ETH
          options: {
            slippage: 0.5,
            bridge: 'stargate'
          }
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('txCalldata');
      expect(Array.isArray(response.body.routes)).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/crosschain/quote')
        .send({
          sourceChainId: 1,
          // Missing destinationChainId
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          outputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          amountIn: '1000000000000000000'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/crosschain/swap', () => {
    it('should return transaction details for valid input', async () => {
      const response = await request(app)
        .post('/api/v1/crosschain/swap')
        .send({
          sourceChainId: 1, // Ethereum
          destinationChainId: 42161, // Arbitrum
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH on Ethereum
          outputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
          amountIn: '1000000000000000000', // 1 ETH
          recipient: '0x1234567890123456789012345678901234567890',
          bridge: 'stargate',
          slippage: 0.5
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('sourceTxHash');
      expect(response.body).toHaveProperty('bridgeId');
      expect(response.body).toHaveProperty('estimatedTime');
      expect(response.body).toHaveProperty('amountOut');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/crosschain/swap')
        .send({
          sourceChainId: 1,
          destinationChainId: 42161,
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          outputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          amountIn: '1000000000000000000',
          recipient: '0x1234567890123456789012345678901234567890'
          // Missing bridge
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/crosschain/status/:bridgeId', () => {
    it('should return transaction status for valid input', async () => {
      const response = await request(app)
        .get('/api/v1/crosschain/status/0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba')
        .query({
          sourceChainId: 1,
          destinationChainId: 42161
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('sourceTxHash');
      expect(response.body).toHaveProperty('destinationTxHash');
      expect(response.body).toHaveProperty('amountOut');
      expect(response.body).toHaveProperty('completedAt');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .get('/api/v1/crosschain/status/0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba')
        .query({
          sourceChainId: 1
          // Missing destinationChainId
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 