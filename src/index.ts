#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig, validateConfig, ConfigurationError } from './config/index.js';
import { createServer } from './server.js';
import { startHttpServer } from './http-server.js';
import { createLogger } from './logger.js';

/**
 * Start server with stdio transport
 */
async function startStdioServer(): Promise<void> {
  const config = loadConfig();
  validateConfig(config);

  const server = createServer({ config });
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log startup (to stderr to not interfere with stdio transport)
  console.error('Ekilex MCP server started successfully (stdio transport)');
  console.error(`Connected to: ${config.baseUrl}`);
}

/**
 * Start server with HTTP/SSE transport
 */
async function startHttpTransport(): Promise<void> {
  const config = loadConfig();
  validateConfig(config);

  const logger = createLogger(config.logLevel);
  const mcpServer = createServer({ config });

  await startHttpServer({
    mcpServer,
    config,
    logger,
  });

  logger.info('Ekilex MCP server started successfully (HTTP transport)');
  logger.info(`Connected to Ekilex API: ${config.baseUrl}`);
}

/**
 * Main entry point for the Ekilex MCP server
 */
async function main(): Promise<void> {
  try {
    const config = loadConfig();

    if (config.transport === 'http') {
      await startHttpTransport();
    } else {
      await startStdioServer();
    }
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(`Configuration error: ${error.message}`);
      process.exit(1);
    }

    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Run main function
void main();
