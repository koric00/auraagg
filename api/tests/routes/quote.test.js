const request = require('supertest');
const app = require('../../src/app');

describe('Quote Routes', () => {
  describe('POST /api/v1/quote', () => {
    it('should return a quote for valid input', async () => {
      const response = await request(app)
        .post('/api/v1/quote')
        .send({
          chainId: 1,
          inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          outputToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          amountIn: '1000000000000000000' // 1 ETH
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('txCalldata');
      expect(Array.isArray(response.body.routes)).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/quote')
        .send({
          chainId: 1,
          // Missing inputToken
          outputToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          amountIn: '1000000000000000000'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/quote/price', () => {
    it('should return a price for valid input', async () => {
      const response = await request(app)
        .get('/api/v1/quote/price')
        .query({
          chainId: 1,
          token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .get('/api/v1/quote/price')
        .query({
          // Missing chainId
          token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 