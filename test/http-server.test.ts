import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { HttpServer } from '../src/http-server.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Config } from '../src/config/index.js';
import { NoopLogger } from '../src/logger.js';

// Mock the McpServer
function createMockMcpServer(): McpServer {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
  } as unknown as McpServer;
}

// Default test config
function createTestConfig(overrides: Partial<Config> = {}): Config {
  return {
    apiKey: 'test-api-key',
    baseUrl: 'https://ekilex.eki.ee',
    timeout: 30000,
    logLevel: 'error',
    transport: 'http',
    httpPort: 0, // Use random available port
    httpHost: 'localhost',
    ...overrides,
  };
}

describe('HttpServer', () => {
  let httpServer: HttpServer;
  let mcpServer: McpServer;
  let config: Config;

  beforeEach(() => {
    mcpServer = createMockMcpServer();
    config = createTestConfig();
    httpServer = new HttpServer({
      mcpServer,
      config,
      logger: new NoopLogger(),
    });
  });

  afterEach(async () => {
    await httpServer.stop();
  });

  describe('health endpoint', () => {
    it('should return healthy status', async () => {
      const app = httpServer.getApp();
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        version: expect.any(String),
        transport: 'http',
        ekilex: {
          baseUrl: 'https://ekilex.eki.ee',
          configured: true,
        },
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return configured: false when no API key', async () => {
      const configWithoutKey = createTestConfig({ apiKey: '' });
      const server = new HttpServer({
        mcpServer,
        config: configWithoutKey,
        logger: new NoopLogger(),
      });

      const app = server.getApp();
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.ekilex.configured).toBe(false);

      await server.stop();
    });
  });

  describe('root endpoint', () => {
    it('should return server info', async () => {
      const app = httpServer.getApp();
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'ekilex-mcp',
        version: expect.any(String),
        description: expect.any(String),
        endpoints: {
          health: '/health',
          sse: '/sse',
          message: '/message',
        },
      });
    });
  });

  describe('message endpoint', () => {
    it('should return 503 when no SSE connection', async () => {
      const app = httpServer.getApp();
      const response = await request(app)
        .post('/message')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(503);
      expect(response.body).toEqual({ error: 'No active SSE connection' });
    });
  });

  describe('start and stop', () => {
    it('should start server on specified port', async () => {
      const serverWithPort = new HttpServer({
        mcpServer: createMockMcpServer(),
        config: createTestConfig({ httpPort: 3456 }),
        logger: new NoopLogger(),
      });

      await serverWithPort.start();
      const app = serverWithPort.getApp();
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);

      await serverWithPort.stop();
    });

    it('should handle stopping when not started', async () => {
      // Should not throw
      await httpServer.stop();
    });
  });
});
