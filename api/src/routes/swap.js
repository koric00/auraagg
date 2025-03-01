const express = require('express');
const router = express.Router();
const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/swap:
 *   post:
 *     summary: Execute a token swap
 *     description: Executes a token swap transaction
 *     tags: [Swap]
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
 *               - recipient
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
 *               recipient:
 *                 type: string
 *                 description: Recipient address
 *               slippage:
 *                 type: number
 *                 description: Slippage tolerance in percentage
 *               deadline:
 *                 type: integer
 *                 description: Transaction deadline in seconds
 *     responses:
 *       200:
 *         description: Successful response with transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txHash:
 *                   type: string
 *                 amountOut:
 *                   type: string
 *                 gasUsed:
 *                   type: integer
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
      recipient: Joi.string().required(),
      slippage: Joi.number().min(0).max(100).default(0.5),
      deadline: Joi.number().integer().default(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Swap request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would call the router engine and execute the transaction
    const response = {
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      amountOut: "999500",
      gasUsed: 150000
    };

    // Return the response
    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/swap/status/{txHash}:
 *   get:
 *     summary: Get swap transaction status
 *     description: Returns the status of a swap transaction
 *     tags: [Swap]
 *     parameters:
 *       - in: path
 *         name: txHash
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction hash
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Chain ID
 *     responses:
 *       200:
 *         description: Successful response with transaction status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, success, failed]
 *                 blockNumber:
 *                   type: integer
 *                 gasUsed:
 *                   type: integer
 *                 effectiveGasPrice:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/status/:txHash', async (req, res, next) => {
  try {
    // Validate parameters
    const schema = Joi.object({
      txHash: Joi.string().required(),
      chainId: Joi.number().integer().required(),
    });

    const { error, value } = schema.validate({
      ...req.params,
      ...req.query
    });
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Transaction status request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would query the blockchain for transaction status
    const response = {
      status: "success",
      blockNumber: 12345678,
      gasUsed: 150000,
      effectiveGasPrice: "20000000000"
    };

    // Return the response
    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 