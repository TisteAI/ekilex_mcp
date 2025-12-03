export * from './ekilex.js';

/**
 * Standard MCP tool response type
 * Includes index signature for compatibility with MCP SDK
 */
export interface McpToolResponse {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
}
