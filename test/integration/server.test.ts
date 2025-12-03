import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServer, getToolDescriptions } from '../../src/server.js';
import { createMockEkilexClient } from '../helpers/mock-ekilex-client.js';
import type { Config } from '../../src/config/index.js';

describe('MCP Server Integration', () => {
  const mockConfig: Config = {
    apiKey: 'test-api-key',
    baseUrl: 'https://ekilex.eki.ee',
    timeout: 30000,
    logLevel: 'info',
  };

  describe('createServer', () => {
    it('should create server instance', () => {
      const mockClient = createMockEkilexClient();
      const server = createServer({
        config: mockConfig,
        ekilexClient: mockClient,
      });

      expect(server).toBeDefined();
    });
  });

  describe('getToolDescriptions', () => {
    it('should return all tool descriptions', () => {
      const tools = getToolDescriptions();

      expect(tools).toHaveLength(5);
      expect(tools.map((t) => t.name)).toContain('search_word');
      expect(tools.map((t) => t.name)).toContain('get_word_details');
      expect(tools.map((t) => t.name)).toContain('search_meaning');
      expect(tools.map((t) => t.name)).toContain('list_datasets');
      expect(tools.map((t) => t.name)).toContain('get_classifiers');
    });

    it('should have descriptions for all tools', () => {
      const tools = getToolDescriptions();

      for (const tool of tools) {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(20);
      }
    });
  });
});
