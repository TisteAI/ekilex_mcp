# CLAUDE.md - Project Context for Claude Code

## Project Overview

This is an MCP (Model Context Protocol) server that provides access to Estonian language resources through the Ekilex API. It allows LLMs like Claude to search dictionaries, look up word definitions, morphology, and usage examples.

## Tech Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript (ESM modules)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **HTTP Server**: Express (for HTTP transport)
- **Validation**: Zod
- **Testing**: Vitest with v8 coverage
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier

## Project Structure

```
src/
├── api/ekilex-client.ts    # HTTP client for Ekilex API
├── config/index.ts         # Environment configuration
├── errors.ts               # Custom error types
├── http-server.ts          # HTTP/SSE transport server
├── logger.ts               # Configurable logging utility
├── server.ts               # MCP server setup, tools, and resources
├── index.ts                # Entry point (stdio/http transport)
├── tools/                  # MCP tool implementations
│   ├── search-word.ts
│   ├── get-word-details.ts
│   ├── search-meaning.ts
│   ├── get-meaning-details.ts
│   ├── list-datasets.ts
│   ├── get-classifiers.ts
│   └── get-domains.ts
└── types/
    ├── ekilex.ts           # Zod schemas for API responses
    └── index.ts            # Shared types (McpToolResponse)

test/
├── api/                    # API client tests
├── tools/                  # Tool handler tests
├── integration/            # Server and real API tests
├── helpers/                # Mock data and utilities
├── http-server.test.ts     # HTTP server tests
└── logger.test.ts          # Logger tests
```

## Key Commands

```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Watch mode (stdio transport)
npm run dev:http       # Watch mode (HTTP transport)
npm run start          # Production (stdio transport)
npm run start:http     # Production (HTTP transport)
npm test               # Run Vitest tests
npm run test:coverage  # Tests with coverage report
npm run lint           # ESLint check
npm run format         # Prettier format
npm run format:check   # Prettier check (CI)
npm run typecheck      # TypeScript type checking
```

## Architecture

### MCP Tools

Each tool in `src/tools/` follows this pattern:
1. **Input Schema** - Zod schema for validation
2. **Handler Factory** - `createXxxHandler(client)` returns async handler
3. **Tool Definition** - `{ name, description, inputSchema }`

Tools are registered in `src/server.ts` using `server.tool()`.

### MCP Resources

Resources provide direct data access without tool calls:
- `ekilex://datasets` - All available datasets
- `ekilex://classifiers/{type}` - Classifier values by type
- `ekilex://domains/{origin}` - Domain classifications

### HTTP Transport

`HttpServer` in `src/http-server.ts`:
- Express server with SSE transport
- Health endpoint at `/health`
- SSE endpoint at `/sse` for MCP clients
- Message endpoint at `/message` for client requests
- Request logging middleware

### Logger

`src/logger.ts` provides:
- Level-based filtering (debug, info, warn, error)
- Timestamped output
- `NoopLogger` for testing

### API Client

`EkilexApiClient` in `src/api/ekilex-client.ts`:
- Injects `ekilex-api-key` header
- Validates responses with Zod schemas
- Transforms errors to typed error classes
- Supports dependency injection of `fetch` for testing

### Type System

Zod schemas in `src/types/ekilex.ts`:
- Use `.passthrough()` to accept unknown fields from real API
- Use `.nullable()` for fields that can be `null`
- Types are inferred with `z.infer<typeof Schema>`

Shared types in `src/types/index.ts`:
- `McpToolResponse` - Standard tool response type with MCP SDK compatibility

## Testing Strategy

- **Unit tests**: Mock `EkilexApiClient` with `createMockEkilexClient()`
- **API tests**: Mock `fetch` function injected via constructor
- **HTTP tests**: Use supertest with Express app
- **Integration tests**: Skip unless `EKILEX_API_KEY` is set

Mock data in `test/helpers/mock-ekilex-client.ts` matches real Ekilex API structure.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EKILEX_API_KEY` | Yes | - | API key from ekilex.ee |
| `EKILEX_BASE_URL` | No | `https://ekilex.eki.ee` | Ekilex API base URL |
| `EKILEX_TIMEOUT` | No | `30000` | Request timeout (ms) |
| `LOG_LEVEL` | No | `info` | Log level: debug, info, warn, error |
| `MCP_TRANSPORT` | No | `stdio` | Transport: `stdio` or `http` |
| `MCP_HTTP_PORT` | No | `3000` | HTTP server port |
| `MCP_HTTP_HOST` | No | `localhost` | HTTP server host |

## Current Status

**Phase 4 Complete** - Production-ready deployment:
- 7 MCP tools: `search_word`, `get_word_details`, `search_meaning`, `get_meaning_details`, `list_datasets`, `get_classifiers`, `get_domains`
- 3 MCP resources: datasets, classifiers, domains
- HTTP/SSE transport with health endpoint
- Configurable logger
- Docker container with multi-stage build
- npm package ready for publishing
- GitHub Actions CI/CD pipeline
- Example configurations for Claude Desktop, Cursor

Coverage: 89%+ statements, 97%+ functions

## Development Notes

### IMPORTANT: Documentation Updates

**Every time a development phase is implemented, documentation MUST be updated:**
1. Update `README.md` with new features, configuration, and usage
2. Update `CLAUDE.md` with new architecture, files, and environment variables
3. Update `DEVELOPMENT_PLAN.md` status if applicable
4. Commit documentation changes with the implementation

### Adding a New Tool

1. Create `src/tools/new-tool.ts` with schema, handler, and tool definition
2. Export from `src/tools/index.ts`
3. Register in `src/server.ts`
4. Add tests in `test/tools/new-tool.test.ts`
5. Update mock client if new API method needed
6. Update documentation (README.md, CLAUDE.md)

### Adding a New Resource

1. Add resource registration in `src/server.ts` using `server.resource()`
2. Use `ResourceTemplate` for parameterized URIs
3. Return `{ contents: [{ uri, mimeType, text }] }`
4. Update documentation

### Working with Ekilex API

- API docs: https://github.com/keeleinstituut/ekilex/wiki/Ekilex-API
- Real API often returns `null` instead of omitting fields
- Use `.optional().nullable()` in Zod schemas
- Response wrapper: `{ success: boolean, message?: string, data?: T }`

### Code Style

- ESM imports with `.js` extension
- Strict TypeScript with `noUncheckedIndexedAccess`
- Prettier for formatting (run before commit)
- No default exports
- Use `McpToolResponse` type for tool handlers

## Useful References

- [MCP Protocol Spec](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Ekilex API Wiki](https://github.com/keeleinstituut/ekilex/wiki/Ekilex-API)
- [Ekilex Source](https://github.com/keeleinstituut/ekilex)
