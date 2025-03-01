const express = require('express');
const router = express.Router();
const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/crosschain/quote:
 *   post:
 *     summary: Get quote for cross-chain token swap
 *     description: Returns optimal routes for swapping tokens across different chains
 *     tags: [CrossChain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceChainId
 *               - destinationChainId
 *               - inputToken
 *               - outputToken
 *               - amountIn
 *             properties:
 *               sourceChainId:
 *                 type: integer
 *                 description: Source chain ID
 *               destinationChainId:
 *                 type: integer
 *                 description: Destination chain ID
 *               inputToken:
 *                 type: string
 *                 description: Input token address on source chain
 *               outputToken:
 *                 type: string
 *                 description: Output token address on destination chain
 *               amountIn:
 *                 type: string
 *                 description: Input amount in wei/smallest unit
 *               options:
 *                 type: object
 *                 properties:
 *                   slippage:
 *                     type: number
 *                     description: Slippage tolerance in percentage
 *                   bridge:
 *                     type: string
 *                     description: Preferred bridge protocol (e.g., "stargate", "across", "hop")
 *     responses:
 *       200:
 *         description: Successful response with cross-chain quote
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
 *                       bridge:
 *                         type: string
 *                       sourcePath:
 *                         type: array
 *                         items:
 *                           type: string
 *                       destinationPath:
 *                         type: array
 *                         items:
 *                           type: string
 *                       amountOut:
 *                         type: string
 *                       estimatedTime:
 *                         type: integer
 *                       totalGasUSD:
 *                         type: string
 *                 txCalldata:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/quote', async (req, res, next) => {
  try {
    // Validate request body
    const schema = Joi.object({
      sourceChainId: Joi.number().integer().required(),
      destinationChainId: Joi.number().integer().required(),
      inputToken: Joi.string().required(),
      outputToken: Joi.string().required(),
      amountIn: Joi.string().required(),
      options: Joi.object({
        slippage: Joi.number().min(0).max(100).default(0.5),
        bridge: Joi.string(),
      }).default(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Cross-chain quote request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would call the router engine
    const response = {
      routes: [
        {
          bridge: "stargate",
          sourcePath: [`${value.inputToken}/USDC/0.3%`],
          destinationPath: [`USDC/${value.outputToken}/0.3%`],
          amountOut: "995000",
          estimatedTime: 300, // seconds
          totalGasUSD: "15.50"
        },
        {
          bridge: "across",
          sourcePath: [`${value.inputToken}/USDC/0.3%`],
          destinationPath: [`USDC/${value.outputToken}/0.3%`],
          amountOut: "997000",
          estimatedTime: 1800, // seconds
          totalGasUSD: "12.75"
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
 * /api/v1/crosschain/swap:
 *   post:
 *     summary: Execute a cross-chain token swap
 *     description: Executes a token swap transaction across different chains
 *     tags: [CrossChain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceChainId
 *               - destinationChainId
 *               - inputToken
 *               - outputToken
 *               - amountIn
 *               - recipient
 *               - bridge
 *             properties:
 *               sourceChainId:
 *                 type: integer
 *                 description: Source chain ID
 *               destinationChainId:
 *                 type: integer
 *                 description: Destination chain ID
 *               inputToken:
 *                 type: string
 *                 description: Input token address on source chain
 *               outputToken:
 *                 type: string
 *                 description: Output token address on destination chain
 *               amountIn:
 *                 type: string
 *                 description: Input amount in wei/smallest unit
 *               recipient:
 *                 type: string
 *                 description: Recipient address on destination chain
 *               bridge:
 *                 type: string
 *                 description: Bridge protocol to use
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
 *                 sourceTxHash:
 *                   type: string
 *                 bridgeId:
 *                   type: string
 *                 estimatedTime:
 *                   type: integer
 *                 amountOut:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/swap', async (req, res, next) => {
  try {
    // Validate request body
    const schema = Joi.object({
      sourceChainId: Joi.number().integer().required(),
      destinationChainId: Joi.number().integer().required(),
      inputToken: Joi.string().required(),
      outputToken: Joi.string().required(),
      amountIn: Joi.string().required(),
      recipient: Joi.string().required(),
      bridge: Joi.string().required(),
      slippage: Joi.number().min(0).max(100).default(0.5),
      deadline: Joi.number().integer().default(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Cross-chain swap request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would call the router engine and execute the transaction
    const response = {
      sourceTxHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      bridgeId: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      estimatedTime: value.bridge === "stargate" ? 300 : 1800, // seconds
      amountOut: "995000"
    };

    // Return the response
    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/crosschain/status/{bridgeId}:
 *   get:
 *     summary: Get cross-chain transaction status
 *     description: Returns the status of a cross-chain transaction
 *     tags: [CrossChain]
 *     parameters:
 *       - in: path
 *         name: bridgeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Bridge transaction ID
 *       - in: query
 *         name: sourceChainId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Source chain ID
 *       - in: query
 *         name: destinationChainId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Destination chain ID
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
 *                   enum: [pending, completed, failed]
 *                 sourceTxHash:
 *                   type: string
 *                 destinationTxHash:
 *                   type: string
 *                 amountOut:
 *                   type: string
 *                 completedAt:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/status/:bridgeId', async (req, res, next) => {
  try {
    // Validate parameters
    const schema = Joi.object({
      bridgeId: Joi.string().required(),
      sourceChainId: Joi.number().integer().required(),
      destinationChainId: Joi.number().integer().required(),
    });

    const { error, value } = schema.validate({
      ...req.params,
      ...req.query
    });
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Log the request
    logger.info(`Cross-chain status request: ${JSON.stringify(value)}`);

    // Mock response for now
    // In a real implementation, this would query the bridge protocol for transaction status
    const response = {
      status: "completed",
      sourceTxHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      destinationTxHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      amountOut: "995000",
      completedAt: Math.floor(Date.now() / 1000) - 300
    };

    // Return the response
    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
 