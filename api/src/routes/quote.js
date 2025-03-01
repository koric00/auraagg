const express = require('express');
const router = express.Router();
const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/quote:
 *   post:
 *     summary: Get quote for token swap
 *     description: Returns optimal routes for swapping tokens
 *     tags: [Quote]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chainId
 *               - inputToken
 *               - outputToken
 *               - amountIn
 *             properties:
 *               chainId:
 *                 type: integer
 *                 description: Chain ID (1 for Ethereum mainnet)
 *               inputToken:
 *                 type: string
 *                 description: Input token address
 *               outputToken:
 *                 type: string
 *                 description: Output token address
 *               amountIn:
 *                 type: string
 *                 description: Input amount in wei/smallest unit
 *               options:
 *                 type: object
 *                 properties:
 *                   slippage:
 *                     type: number
 *                     description: Slippage tolerance in percentage
 *                   exchanges:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of exchanges to include
 *     responses:
 *       200:
 *         description: Successful response with quote
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 routes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *                       amountOut:
 *                         type: string
 *                       gasEstimate:
 *                         type: integer
 *                       riskScore:
 *                         type: integer
 *                 txCalldata:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const schema = Joi.object({
      chainId: Joi.number().integer().required(),
      inputToken: Joi.string().required(),
      outputToken: Joi.string().required(),
      amountIn: Joi.string().required(),
      options: Joi.object({
        slippage: Joi.number().min(0).max(100).default(0.5),
        exchanges: Joi.array().items(Joi.string()),
      }).default(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Quote request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would call the router engine
    const response = {
      routes: [
        {
          path: [`${value.inputToken}/${value.outputToken}/0.3%`],
          amountOut: "999500",
          gasEstimate: 150000,
          riskScore: 2
        }
      ],
      txCalldata: "0x1234567890abcdef"
    };

    // Return the response
    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/quote/price:
 *   get:
 *     summary: Get token price
 *     description: Returns the price of a token in USD
 *     tags: [Quote]
 *     parameters:
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Chain ID
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token address
 *     responses:
 *       200:
 *         description: Successful response with price
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 price:
 *                   type: number
 *                 timestamp:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/price', async (req, res, next) => {
  try {
    // Validate query parameters
    const schema = Joi.object({
      chainId: Joi.number().integer().required(),
      token: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Price request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would call a price oracle
    const response = {
      price: 1850.75,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Return the response
    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 