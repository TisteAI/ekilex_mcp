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

Set your Ekilex API key as an environment variable:

```bash
export EKILEX_API_KEY=your-api-key
```

Get your API key from [Ekilex](https://ekilex.ee) user profile page.

## Usage

### With Claude Desktop

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

### Standalone

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

## Development

### Prerequisites

- Node.js 22+
- npm

### Scripts

```bash
npm run build       # Build TypeScript
npm run dev         # Development mode with watch
npm test            # Run tests
npm run test:coverage  # Run tests with coverage
npm run lint        # Lint code
npm run format      # Format code with Prettier
npm run typecheck   # Type check
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

**Phase 2 Complete** - All 7 core tools implemented with 90%+ test coverage.

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
