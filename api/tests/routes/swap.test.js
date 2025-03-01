const request = require('supertest');
const app = require('../../src/app');

describe('Swap Routes', () => {
  describe('POST /api/v1/swap', () => {
    it('should return transaction details for valid input', async () => {
      const response = await request(app)
        .post('/api/v1/swap')
        .send({
          chainId: 1,
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          outputToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          amountIn: '1000000000000000000', // 1 ETH
          recipient: '0x1234567890123456789012345678901234567890',
          slippage: 0.5
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('txHash');
      expect(response.body).toHaveProperty('amountOut');
      expect(response.body).toHaveProperty('gasUsed');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/swap')
        .send({
          chainId: 1,
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          outputToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          amountIn: '1000000000000000000'
          // Missing recipient
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/swap/status/:txHash', () => {
    it('should return transaction status for valid input', async () => {
      const response = await request(app)
        .get('/api/v1/swap/status/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
        .query({
          chainId: 1
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body).toHaveProperty('gasUsed');
      expect(response.body).toHaveProperty('effectiveGasPrice');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .get('/api/v1/swap/status/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
        // Missing chainId

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 