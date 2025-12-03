#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig, validateConfig, ConfigurationError } from './config/index.js';
import { createServer } from './server.js';

/**
 * Main entry point for the Ekilex MCP server
 */
async function main(): Promise<void> {
  try {
    // Load and validate configuration
    const config = loadConfig();
    validateConfig(config);

    // Create the MCP server
    const server = createServer({ config });

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Log startup (to stderr to not interfere with stdio transport)
    console.error('Ekilex MCP server started successfully');
    console.error(`Connected to: ${config.baseUrl}`);
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
