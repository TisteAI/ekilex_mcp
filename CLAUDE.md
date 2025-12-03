# CLAUDE.md - Project Context for Claude Code

## Project Overview

This is an MCP (Model Context Protocol) server that provides access to Estonian language resources through the Ekilex API. It allows LLMs like Claude to search dictionaries, look up word definitions, morphology, and usage examples.

## Tech Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript (ESM modules)
- **MCP SDK**: `@modelcontextprotocol/sdk`
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
├── server.ts               # MCP server setup and tool registration
├── index.ts                # Entry point (stdio transport)
├── tools/                  # MCP tool implementations
│   ├── search-word.ts
│   ├── get-word-details.ts
│   ├── search-meaning.ts
│   ├── get-meaning-details.ts
│   ├── list-datasets.ts
│   ├── get-classifiers.ts
│   └── get-domains.ts
└── types/
    └── ekilex.ts           # Zod schemas for API responses

test/
├── api/                    # API client tests
├── tools/                  # Tool handler tests
├── integration/            # Server and real API tests
└── helpers/                # Mock data and utilities
```

## Key Commands

```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Watch mode for development
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

## Testing Strategy

- **Unit tests**: Mock `EkilexApiClient` with `createMockEkilexClient()`
- **API tests**: Mock `fetch` function injected via constructor
- **Integration tests**: Skip unless `EKILEX_API_KEY` is set

Mock data in `test/helpers/mock-ekilex-client.ts` matches real Ekilex API structure.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EKILEX_API_KEY` | Yes | API key from ekilex.ee |
| `EKILEX_BASE_URL` | No | Default: `https://ekilex.eki.ee` |
| `EKILEX_TIMEOUT` | No | Default: `30000` (ms) |
| `LOG_LEVEL` | No | Default: `info` |

## Current Status

**Phase 2 Complete** - All 7 core tools implemented:
- `search_word`, `get_word_details`
- `search_meaning`, `get_meaning_details`
- `list_datasets`, `get_classifiers`, `get_domains`

Coverage: 91%+ statements, 85%+ functions

## Development Notes

### Adding a New Tool

1. Create `src/tools/new-tool.ts` with schema, handler, and tool definition
2. Export from `src/tools/index.ts`
3. Register in `src/server.ts`
4. Add tests in `test/tools/new-tool.test.ts`
5. Update mock client if new API method needed

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

## Useful References

- [MCP Protocol Spec](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Ekilex API Wiki](https://github.com/keeleinstituut/ekilex/wiki/Ekilex-API)
- [Ekilex Source](https://github.com/keeleinstituut/ekilex)
