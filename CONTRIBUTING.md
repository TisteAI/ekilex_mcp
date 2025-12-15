# Contributing to Ekilex MCP Server

Thank you for your interest in contributing to the Ekilex MCP Server! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the project community.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When creating a bug report, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please:
- Check existing issues first
- Provide clear use cases
- Explain why this feature would be useful
- Consider implementation complexity

### Pull Requests

1. **Fork the repository** and create a branch from `main`
2. **Follow the development setup** below
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Ensure all tests pass** and coverage remains high
6. **Update documentation** as needed
7. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 22+
- npm

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/ekilex_mcp.git
cd ekilex_mcp

# Install dependencies
npm install

# Set up your API key for testing
export EKILEX_API_KEY=your-api-key-here
```

### Development Workflow

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Coding Standards

### TypeScript

- Use strict TypeScript mode
- Prefer explicit types over `any`
- Use ESM imports with `.js` extensions
- Follow existing code style

### Testing

- **Test coverage required**: Maintain 80%+ coverage
- **TDD encouraged**: Write tests before implementation
- **Test structure**:
  - Unit tests in `test/` mirroring `src/` structure
  - Integration tests in `test/integration/`
  - Use descriptive test names

### Code Style

- Format with Prettier (run `npm run format`)
- Lint with ESLint (run `npm run lint`)
- No default exports
- Use clear, descriptive variable names
- Add JSDoc comments for public APIs

### Commits

- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic

Example:
```
Fix word search with special characters (#123)

- Escape special regex characters in search queries
- Add tests for Estonian characters (õ, ä, ö, ü)
- Update documentation
```

## Adding a New Tool

When adding a new MCP tool:

1. Create tool definition in `src/tools/your-tool.ts`:
   ```typescript
   import { z } from 'zod';
   import type { EkilexApiClient } from '../api/index.js';
   import type { McpToolResponse } from '../types/index.js';

   export const yourToolInputSchema = z.object({
     param: z.string().describe('Parameter description'),
   });

   export const yourTool = {
     name: 'your_tool',
     description: 'Tool description',
     inputSchema: yourToolInputSchema,
   };

   export function createYourToolHandler(client: EkilexApiClient) {
     return async (args: z.infer<typeof yourToolInputSchema>): Promise<McpToolResponse> => {
       // Implementation
     };
   }
   ```

2. Add tests in `test/tools/your-tool.test.ts`
3. Export from `src/tools/index.ts`
4. Register in `src/server.ts` using `server.registerTool()`
5. Update README.md with tool documentation
6. Update CHANGELOG.md

## Adding a New Resource

When adding a new MCP resource:

1. Register in `src/server.ts` using `server.registerResource()`
2. Add tests
3. Update documentation

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Fixing bugs that affect usage
- Adding environment variables

Files to update:
- `README.md` - User-facing documentation
- `CLAUDE.md` - Project context for AI assistants
- `CHANGELOG.md` - Version history
- Code comments - For complex logic

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createMockEkilexClient } from '../helpers/mock-ekilex-client.js';

describe('yourTool', () => {
  it('should handle valid input', async () => {
    const mockClient = createMockEkilexClient({
      yourMethod: vi.fn().mockResolvedValue({ data: 'test' })
    });

    const handler = createYourToolHandler(mockClient);
    const result = await handler({ param: 'value' });

    expect(result.content[0].text).toContain('expected output');
  });
});
```

### Integration Tests

- Skipped by default unless `EKILEX_API_KEY` is set
- Test against real Ekilex API
- Use in `test/integration/`

## Pull Request Process

1. **Update documentation** - README, CLAUDE.md, CHANGELOG.md
2. **Ensure CI passes** - All tests, linting, type checking
3. **Request review** - Wait for maintainer feedback
4. **Address feedback** - Make requested changes
5. **Merge** - Maintainer will merge once approved

## Release Process

<!--
MANUAL ACTION REQUIRED:
If you're a maintainer, add details about the release process here:
- How versions are determined (semver)
- Who can create releases
- Release checklist
-->

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will automatically publish to npm and Docker Hub

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Ekilex MCP Server! 🎉
