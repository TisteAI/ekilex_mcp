# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Ekilex MCP Server
- 7 MCP tools for Estonian language resources
  - `search_word` - Search for words with wildcard support
  - `get_word_details` - Get complete word information
  - `search_meaning` - Search by semantic meaning
  - `get_meaning_details` - Get meaning details
  - `list_datasets` - List available datasets
  - `get_classifiers` - Get classifier information
  - `get_domains` - Get domain classifications
- 3 MCP resources
  - `ekilex://datasets` - Available datasets
  - `ekilex://classifiers/{type}` - Classifier values
  - `ekilex://domains/{origin}` - Domain classifications
- HTTP/SSE transport with health endpoint
- Stdio transport for local usage
- Docker container support
- Comprehensive test suite (89%+ coverage)
- CI/CD pipeline with GitHub Actions
- Example configurations for Claude Desktop and Cursor

### Changed
- Updated to latest MCP SDK v1.23.0
- Migrated from deprecated `tool()` to `registerTool()`
- Migrated from deprecated `resource()` to `registerResource()`
- Migrated from deprecated `SSEServerTransport` to `StreamableHTTPServerTransport`

### Fixed
- Updated MCP SDK API calls to use non-deprecated methods

## [0.1.0] - YYYY-MM-DD

<!--
MANUAL ACTION REQUIRED:
Update the date above when you publish the first release.
Example: ## [0.1.0] - 2024-12-15
-->

### Added
- Initial implementation

[Unreleased]: https://github.com/TisteAI/ekilex_mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/TisteAI/ekilex_mcp/releases/tag/v0.1.0
