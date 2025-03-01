// Set environment to test
process.env.NODE_ENV = 'test';

// Load environment variables from .env.test if it exists
require('dotenv').config({ path: '.env.test' });

// Mock logger to prevent logging during tests
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  stream: {
    write: jest.fn()
  }
}));

// Global test timeout
jest.setTimeout(30000); 