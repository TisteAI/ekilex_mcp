import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { EkilexApiClient } from './api/index.js';
import type { Config } from './config/index.js';
import {
  searchWordTool,
  createSearchWordHandler,
  getWordDetailsTool,
  createGetWordDetailsHandler,
  searchMeaningTool,
  createSearchMeaningHandler,
  getMeaningDetailsTool,
  createGetMeaningDetailsHandler,
  listDatasetsTool,
  createListDatasetsHandler,
  getClassifiersTool,
  createGetClassifiersHandler,
  getDomainsTool,
  createGetDomainsHandler,
  CLASSIFIER_TYPES,
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

  // Register get_meaning_details tool
  server.tool(
    getMeaningDetailsTool.name,
    getMeaningDetailsTool.description,
    getMeaningDetailsTool.inputSchema.shape,
    createGetMeaningDetailsHandler(client)
  );

  // Register get_domains tool
  server.tool(
    getDomainsTool.name,
    getDomainsTool.description,
    getDomainsTool.inputSchema.shape,
    createGetDomainsHandler(client)
  );

  // Register datasets resource
  server.resource(
    'datasets',
    'ekilex://datasets',
    {
      description: 'List of all available dictionary datasets in Ekilex',
      mimeType: 'application/json',
    },
    async () => {
      const datasets = await client.getDatasets();
      return {
        contents: [
          {
            uri: 'ekilex://datasets',
            mimeType: 'application/json',
            text: JSON.stringify(datasets, null, 2),
          },
        ],
      };
    }
  );

  // Register classifiers resource template
  server.resource(
    'classifiers',
    new ResourceTemplate('ekilex://classifiers/{type}', { list: undefined }),
    {
      description:
        'Classifier values for word attributes. Types: POS (parts of speech), MORPH (morphology), DOMAIN (subject areas), REGISTER (formal/informal)',
      mimeType: 'application/json',
    },
    async (uri: URL) => {
      // Extract type from URI
      const match = /ekilex:\/\/classifiers\/(.+)/.exec(uri.href);
      const type = match?.[1];

      if (!type || !CLASSIFIER_TYPES.includes(type as (typeof CLASSIFIER_TYPES)[number])) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'text/plain',
              text: `Invalid classifier type. Valid types: ${CLASSIFIER_TYPES.join(', ')}`,
            },
          ],
        };
      }

      const classifiers = await client.getClassifiers(type);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(classifiers, null, 2),
          },
        ],
      };
    }
  );

  // Register domains resource template
  server.resource(
    'domains',
    new ResourceTemplate('ekilex://domains/{origin}', { list: undefined }),
    {
      description: 'Domain classifications by origin for categorizing words by subject area',
      mimeType: 'application/json',
    },
    async (uri: URL) => {
      // Extract origin from URI
      const match = /ekilex:\/\/domains\/(.+)/.exec(uri.href);
      const origin = match?.[1];

      if (!origin) {
        const origins = await client.getDomainOrigins();
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ availableOrigins: origins }, null, 2),
            },
          ],
        };
      }

      const domains = await client.getDomains(origin);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(domains, null, 2),
          },
        ],
      };
    }
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
    { name: getMeaningDetailsTool.name, description: getMeaningDetailsTool.description },
    { name: listDatasetsTool.name, description: listDatasetsTool.description },
    { name: getClassifiersTool.name, description: getClassifiersTool.description },
    { name: getDomainsTool.name, description: getDomainsTool.description },
  ];
}
