# Ekilex MCP Server

An MCP (Model Context Protocol) server providing access to Estonian language resources through the Ekilex dictionary and terminology database system.

## Overview

This project enables LLMs to access Estonian language resources from [Ekilex](https://github.com/keeleinstituut/ekilex) and [Sonaveeb](https://sonaveeb.ee) through the standardized Model Context Protocol.

## Features

- **Word Search** - Search with wildcard support (`*` and `?`)
- **Word Details** - Complete definitions, morphology, usage examples
- **Meaning Search** - Semantic concept-based search
- **Meaning Details** - Full meaning information with related words
- **Dataset Browsing** - Access to 80+ dictionaries and terminology databases
- **Classifiers** - Parts of speech, morphology, domains, registers
- **Domain Classification** - Subject area categorization
- **HTTP Transport** - REST API with health endpoint and SSE support
- **MCP Resources** - Direct access to datasets, classifiers, and domains

## Installation

```bash
# Clone the repository
git clone https://github.com/TisteAI/ekilex_mcp.git
cd ekilex_mcp

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EKILEX_API_KEY` | Yes | - | API key from ekilex.ee |
| `EKILEX_BASE_URL` | No | `https://ekilex.eki.ee` | Ekilex API base URL |
| `EKILEX_TIMEOUT` | No | `30000` | Request timeout (ms) |
| `LOG_LEVEL` | No | `info` | Log level: debug, info, warn, error |
| `MCP_TRANSPORT` | No | `stdio` | Transport: `stdio` or `http` |
| `MCP_HTTP_PORT` | No | `3000` | HTTP server port |
| `MCP_HTTP_HOST` | No | `localhost` | HTTP server host |

Get your API key from [Ekilex](https://ekilex.ee) user profile page.

## Usage

### With Claude Desktop (stdio transport)

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ekilex": {
      "command": "node",
      "args": ["/path/to/ekilex_mcp/dist/index.js"],
      "env": {
        "EKILEX_API_KEY": "your-api-key"
      }
    }
  }
}
```

### HTTP Transport

Start the server with HTTP transport for REST API access:

```bash
# Development mode
npm run dev:http

# Production mode
npm run start:http
```

HTTP Endpoints:
- `GET /` - Server info
- `GET /health` - Health check with status
- `GET /sse` - SSE endpoint for MCP clients
- `POST /message` - MCP message endpoint

### Standalone (stdio)

```bash
EKILEX_API_KEY=your-api-key node dist/index.js
```

## Available Tools

| Tool | Description |
|------|-------------|
| `search_word` | Search for Estonian words with wildcard support |
| `get_word_details` | Get complete word information (definitions, morphology, examples) |
| `search_meaning` | Search by semantic meaning or concept |
| `get_meaning_details` | Get full meaning details with related words |
| `list_datasets` | List available dictionary datasets |
| `get_classifiers` | Get POS, morphology, domain, register classifiers |
| `get_domains` | Get domain classifications by origin |

## MCP Resources

| Resource URI | Description |
|--------------|-------------|
| `ekilex://datasets` | List of all available datasets |
| `ekilex://classifiers/{type}` | Classifier values (POS, MORPH, DOMAIN, REGISTER) |
| `ekilex://domains/{origin}` | Domain classifications by origin |

## Development

### Prerequisites

- Node.js 22+
- npm

### Scripts

```bash
npm run build          # Build TypeScript
npm run dev            # Development mode (stdio)
npm run dev:http       # Development mode (HTTP)
npm run start          # Production mode (stdio)
npm run start:http     # Production mode (HTTP)
npm test               # Run tests
npm run test:coverage  # Run tests with coverage
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run typecheck      # Type check
```

### Project Structure

```
ekilex_mcp/
├── src/
│   ├── api/           # Ekilex API client
│   ├── config/        # Configuration management
│   ├── tools/         # MCP tool implementations
│   ├── types/         # Zod schemas and types
│   ├── errors.ts      # Error types
│   ├── http-server.ts # HTTP/SSE transport
│   ├── logger.ts      # Logging utility
│   ├── server.ts      # MCP server setup
│   └── index.ts       # Entry point
├── test/
│   ├── api/           # API client tests
│   ├── tools/         # Tool handler tests
│   ├── integration/   # Integration tests
│   └── helpers/       # Test utilities
└── dist/              # Compiled output
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests (requires API key)
EKILEX_API_KEY=your-key npm test
```

## API Coverage

The server implements read operations from the Ekilex API:

- `/api/word/search/{word}` - Word search
- `/api/word/details/{wordId}` - Word details
- `/api/meaning/search/{word}` - Meaning search
- `/api/meaning/details/{meaningId}` - Meaning details
- `/api/datasets` - Dataset listing
- `/api/classifiers/{type}` - Classifier lookup
- `/api/domains/{origin}` - Domain listing
- `/api/domainorigins` - Domain origin listing

## Status

**Phase 3 Complete** - HTTP transport, MCP resources, and logging:
- 7 MCP tools implemented
- 3 MCP resources (datasets, classifiers, domains)
- HTTP/SSE transport with health endpoint
- Configurable logging
- 169 tests, 89%+ coverage

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full roadmap.

## Target Users

- Language learners studying Estonian
- Translators working with Estonian
- Developers building Estonian language applications
- Linguists and researchers

## License

MIT

## Acknowledgments

- [Ekilex](https://ekilex.ee) - Estonian Language Institute dictionary system
- [Sonaveeb](https://sonaveeb.ee) - Estonian language portal
- Data licensed under CC BY 4.0
