import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { EkilexApiClient } from './api/index.js';
import type { Config } from './config/index.js';
import {
  searchWordTool,
  createSearchWordHandler,
  getWordDetailsTool,
  createGetWordDetailsHandler,
  searchMeaningTool,
  createSearchMeaningHandler,
  listDatasetsTool,
  createListDatasetsHandler,
  getClassifiersTool,
  createGetClassifiersHandler,
} from './tools/index.js';

/**
 * Package info for server identification
 */
const SERVER_INFO = {
  name: 'ekilex-mcp',
  version: '0.1.0',
};

/**
 * Options for creating the MCP server
 */
export interface CreateServerOptions {
  /** Configuration with API key and settings */
  config: Config;
  /** Optional pre-configured Ekilex client (for testing) */
  ekilexClient?: EkilexApiClient;
}

/**
 * Create and configure the Ekilex MCP server
 */
export function createServer(options: CreateServerOptions): McpServer {
  const { config, ekilexClient } = options;

  // Create API client if not provided
  const client = ekilexClient ?? EkilexApiClient.fromConfig(config);

  // Create MCP server
  const server = new McpServer(SERVER_INFO);

  // Register search_word tool
  server.tool(
    searchWordTool.name,
    searchWordTool.description,
    searchWordTool.inputSchema.shape,
    createSearchWordHandler(client)
  );

  // Register get_word_details tool
  server.tool(
    getWordDetailsTool.name,
    getWordDetailsTool.description,
    getWordDetailsTool.inputSchema.shape,
    createGetWordDetailsHandler(client)
  );

  // Register search_meaning tool
  server.tool(
    searchMeaningTool.name,
    searchMeaningTool.description,
    searchMeaningTool.inputSchema.shape,
    createSearchMeaningHandler(client)
  );

  // Register list_datasets tool
  server.tool(
    listDatasetsTool.name,
    listDatasetsTool.description,
    listDatasetsTool.inputSchema.shape,
    createListDatasetsHandler(client)
  );

  // Register get_classifiers tool
  server.tool(
    getClassifiersTool.name,
    getClassifiersTool.description,
    getClassifiersTool.inputSchema.shape,
    createGetClassifiersHandler(client)
  );

  return server;
}

/**
 * Get list of all registered tools (for documentation)
 */
export function getToolDescriptions(): { name: string; description: string }[] {
  return [
    { name: searchWordTool.name, description: searchWordTool.description },
    { name: getWordDetailsTool.name, description: getWordDetailsTool.description },
    { name: searchMeaningTool.name, description: searchMeaningTool.description },
    { name: listDatasetsTool.name, description: listDatasetsTool.description },
    { name: getClassifiersTool.name, description: getClassifiersTool.description },
  ];
}
