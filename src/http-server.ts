import express, { type Express, type Request, type Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Config } from './config/index.js';
import { createLogger, type Logger } from './logger.js';

/**
 * Server version for health endpoint
 */
const SERVER_VERSION = '0.1.0';

/**
 * Options for creating the HTTP server
 */
export interface HttpServerOptions {
  /** MCP server instance */
  mcpServer: McpServer;
  /** Configuration */
  config: Config;
  /** Optional logger instance */
  logger?: Logger;
}

/**
 * HTTP server with MCP SSE transport and health endpoint
 */
export class HttpServer {
  private readonly app: Express;
  private readonly mcpServer: McpServer;
  private readonly config: Config;
  private readonly logger: Logger;
  private server?: ReturnType<Express['listen']>;
  private transport?: SSEServerTransport;

  constructor(options: HttpServerOptions) {
    this.mcpServer = options.mcpServer;
    this.config = options.config;
    this.logger = options.logger ?? createLogger(options.config.logLevel);
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Set up Express middleware
   */
  private setupMiddleware(): void {
    // Request logging middleware
    this.app.use((req: Request, _res: Response, next) => {
      this.logger.info(`${req.method} ${req.path}`);
      next();
    });

    // JSON body parsing
    this.app.use(express.json());
  }

  /**
   * Set up HTTP routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        version: SERVER_VERSION,
        timestamp: new Date().toISOString(),
        transport: 'http',
        ekilex: {
          baseUrl: this.config.baseUrl,
          configured: Boolean(this.config.apiKey),
        },
      });
    });

    // MCP SSE endpoint
    this.app.get('/sse', async (req: Request, res: Response) => {
      this.logger.info('New SSE connection');

      // Create SSE transport for this connection
      this.transport = new SSEServerTransport('/message', res);

      // Connect MCP server to transport
      await this.mcpServer.connect(this.transport);

      // Handle client disconnect
      req.on('close', () => {
        this.logger.info('SSE connection closed');
      });
    });

    // MCP message endpoint (for SSE transport)
    this.app.post('/message', async (req: Request, res: Response) => {
      if (!this.transport) {
        res.status(503).json({ error: 'No active SSE connection' });
        return;
      }

      try {
        await this.transport.handlePostMessage(req, res);
      } catch (error) {
        this.logger.error('Error handling message:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Root endpoint with server info
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        name: 'ekilex-mcp',
        version: SERVER_VERSION,
        description: 'MCP server for Estonian language resources from Ekilex',
        endpoints: {
          health: '/health',
          sse: '/sse',
          message: '/message',
        },
      });
    });
  }

  /**
   * Start the HTTP server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.httpPort, this.config.httpHost, () => {
        this.logger.info(
          `HTTP server listening on http://${this.config.httpHost}:${this.config.httpPort}`
        );
        this.logger.info(
          `Health endpoint: http://${this.config.httpHost}:${this.config.httpPort}/health`
        );
        this.logger.info(
          `SSE endpoint: http://${this.config.httpHost}:${this.config.httpPort}/sse`
        );
        resolve();
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info('HTTP server stopped');
          resolve();
        }
      });
    });
  }

  /**
   * Get the Express app instance (for testing)
   */
  getApp(): Express {
    return this.app;
  }
}

/**
 * Create and start an HTTP server
 */
export async function startHttpServer(options: HttpServerOptions): Promise<HttpServer> {
  const server = new HttpServer(options);
  await server.start();
  return server;
}
