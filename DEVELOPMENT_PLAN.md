# Ekilex MCP Server - Comprehensive Development Plan

## Project Overview

### Core Purpose and Problem Being Solved

The Ekilex MCP Server aims to provide a standardized interface for Language Learning Models (LLMs) to access Estonian language resources through the Model Context Protocol (MCP). Currently, accessing the rich lexicographic data from Ekilex and Sonaveeb requires manual API integration or web scraping, creating barriers for developers building AI-powered language tools.

This MCP server will enable:
- Seamless integration of Estonian dictionary data into AI assistants
- Programmatic access to word definitions, morphology, examples, and translations
- Support for language learners, translators, linguists, and NLP researchers
- Standardized tooling that works with Claude, ChatGPT, Cursor, and other MCP-compatible clients

### Target Users and Use Cases

**Primary Users:**
1. **Language Learners** - Using LLMs to study Estonian with accurate dictionary data
2. **Translators** - Accessing definitions, collocations, and usage examples during translation
3. **Developers** - Building Estonian language applications with AI integration
4. **Linguists/Researchers** - Accessing morphological data and corpus examples
5. **Content Creators** - Writers needing precise Estonian vocabulary assistance

**Use Cases:**
- Word lookup with full definitions and examples
- Morphological analysis (word forms, conjugations, declensions)
- Finding collocations and usage patterns
- Cross-language translations (Estonian-English-Russian)
- Domain-specific terminology lookup
- Corpus example searches

### Key Features and Functionality

**Core Features:**
1. **Word Search** - Search across multiple datasets with wildcard support
2. **Word Details** - Complete lexical information including definitions, examples, morphology
3. **Meaning Search** - Semantic-based word lookup
4. **Morphological Information** - Word forms and grammatical data
5. **Dataset Browsing** - Access to 80+ dictionaries and terminology databases
6. **Classifier Lookup** - Parts of speech, domains, registers
7. **Example Sentences** - Corpus-based usage examples

**Advanced Features:**
- Multi-dataset querying
- Bilingual dictionary support (Estonian-Russian, Estonian-English)
- Learner-mode simplified definitions
- Domain filtering (legal, medical, technical terminology)

### Success Criteria

1. **Functional**: All Ekilex API endpoints accessible via MCP tools
2. **Performance**: Response times < 2 seconds for word lookups
3. **Reliability**: 99%+ uptime with graceful error handling
4. **Usability**: Clear tool descriptions enabling accurate LLM tool selection
5. **Test Coverage**: 80%+ unit test coverage for business logic
6. **Documentation**: Complete API documentation and usage examples

### Known Constraints and Limitations

1. **API Key Requirement**: Users must obtain an Ekilex API key (free registration)
2. **Rate Limiting**: Ekilex API has usage limits (unspecified publicly)
3. **Data Licensing**: CC BY 4.0 - requires attribution for derivative works
4. **Language Scope**: Primarily Estonian, with Russian/English secondary support
5. **CRUD Restrictions**: Modification operations require admin permissions
6. **Network Dependency**: Requires internet access to Ekilex servers

### Scope Boundaries

**In Scope:**
- MCP server implementation with tools and resources
- All read operations from Ekilex API
- Configuration for API key management
- Both stdio and HTTP transports
- Comprehensive testing suite
- Docker containerization
- CI/CD pipeline

**Out of Scope:**
- Ekilex CRUD operations (create/update/delete)
- Custom dictionary hosting
- Offline mode / local caching of entire dictionaries
- User management within the MCP server
- Mobile SDKs
- EstNLTK integration (future enhancement)

---

## Step 1: Research & Information Gathering

### Domain Research

#### Industry Best Practices

**Dictionary/Language MCP Server Patterns:**
Based on analysis of existing implementations (DeepL MCP Server, Lara Translate MCP, SimpleLocalize MCP):

1. **Clear Tool Descriptions**: Tools must have precise descriptions for LLM tool selection
2. **Structured Responses**: Return data in consistent, parseable formats
3. **Error Messaging**: Provide actionable error messages for AI retry logic
4. **Language Detection**: Support automatic source language detection where applicable
5. **Context Injection**: Allow custom instructions to guide output behavior

**Lexicographic API Standards:**
- RESTful design with resource-based URLs
- JSON response format with consistent schema
- Wildcard search support (`*`, `?`)
- Dataset filtering capabilities
- Pagination for large result sets

#### Existing Solutions Analysis

**Ekilex/Sonaveeb Ecosystem:**
- **Ekilex**: Backend dictionary writing system with REST API
- **Sonaveeb**: Public-facing portal consuming Ekilex data
- **Wordweb-app**: Simplified web interface

**Third-Party Integrations:**
- **anki-sonaveeb**: Anki addon scraping Sonaveeb (demonstrates demand for programmatic access)
- **Keelevara**: Direct Ekilex API integration

**Gaps in Current Solutions:**
- No MCP server exists for Estonian language resources
- Existing integrations are application-specific
- No standardized LLM interface for Ekilex

#### Regulatory/Compliance Requirements

1. **Data Licensing**: CC BY 4.0 - must include attribution in responses
2. **GDPR**: No personal data handled (dictionary data only)
3. **Rate Limiting Ethics**: Respect Ekilex server capacity (referenced in anki-sonaveeb license)
4. **API Terms of Service**: Single API key per user

### Technical Landscape

#### MCP Protocol Analysis

**Protocol Version**: 2025-06-18 (latest stable)

**Key Specifications:**
- JSON-RPC 2.0 messaging
- Capability negotiation between client/server
- Three primitives: Tools, Resources, Prompts
- Transports: stdio, Streamable HTTP (SSE deprecated)

**Server Primitives:**
1. **Tools**: Model-controlled functions with input/output schemas
2. **Resources**: Application-controlled data exposure
3. **Prompts**: Templated message workflows

**SDK Options:**
- `@modelcontextprotocol/sdk` (TypeScript) - Official, well-documented
- `mcp` (Python) - Official Python SDK
- `FastMCP` - Higher-level TypeScript framework with conveniences

#### Ekilex API Capabilities

**Authentication:**
- API key via header: `ekilex-api-key: [key]`
- One key per registered user

**Endpoints (from GitHub Wiki):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/word/search/{word}[/{datasets}]` | GET | Word search with wildcards |
| `/api/meaning/search/{word}[/{datasets}]` | GET | Semantic meaning search |
| `/api/word/details/{wordId}[/{datasets}]` | GET | Complete word information |
| `/api/meaning/details/{meaningId}[/{datasets}]` | GET | Meaning details |
| `/api/source/search/{sourceProperty}` | GET | Source search |
| `/api/public_word/{datasetCode}` | GET | Public word list |
| `/api/datasets` | GET | Available datasets |
| `/api/classifiers/{classifierName}` | GET | POS, MORPH, DOMAIN, REGISTER |
| `/api/domains/{origin}` | GET | Domain classifications |
| `/api/domainorigins` | GET | Domain origin list |
| `/api/endpoints` | GET | API specification |

**Response Format:**
```json
{
  "success": true,
  "message": "descriptive message",
  "data": { ... }
}
```

#### EstNLTK Consideration

EstNLTK provides local morphological analysis but requires:
- Python runtime
- Additional dependencies (Java for some features)
- Significant complexity increase

**Decision**: Defer EstNLTK integration to future enhancement. Focus on pure Ekilex API integration for MVP.

### Requirements Analysis

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Search words across datasets | Must Have |
| FR-02 | Get complete word details | Must Have |
| FR-03 | Search by semantic meaning | Must Have |
| FR-04 | List available datasets | Must Have |
| FR-05 | Get classifier information | Should Have |
| FR-06 | Get domain classifications | Should Have |
| FR-07 | Wildcard search support | Must Have |
| FR-08 | Multi-dataset filtering | Should Have |
| FR-09 | Source/citation lookup | Could Have |
| FR-10 | API endpoint discovery | Could Have |

#### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Response latency | < 2s average |
| NFR-02 | Availability | 99% (depends on Ekilex) |
| NFR-03 | Test coverage | 80% unit, 70% integration |
| NFR-04 | Memory footprint | < 256MB |
| NFR-05 | Startup time | < 5 seconds |
| NFR-06 | Concurrent requests | 10+ parallel |

#### Integration Requirements

1. **MCP Clients**: Claude Desktop, Cursor, VS Code, OpenAI
2. **Ekilex API**: REST over HTTPS
3. **Configuration**: Environment variables, JSON config file

### Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Ekilex API changes | High | Low | Version pinning, adapter pattern |
| Rate limiting | Medium | Medium | Caching, backoff strategies |
| API key exposure | High | Low | Secure secrets management |
| Ekilex downtime | High | Low | Graceful degradation, clear errors |
| MCP spec changes | Medium | Low | SDK updates, abstraction layers |
| Complex response parsing | Medium | Medium | Comprehensive testing, type safety |

### Assumptions and Clarifications

**Assumptions:**
1. Ekilex API remains publicly accessible with free registration
2. API rate limits are reasonable for typical LLM usage patterns
3. MCP protocol remains stable at 2025-06-18 version
4. Users will manage their own Ekilex API keys

**Open Questions:**
1. What are the exact Ekilex rate limits?
2. Is there a preferred caching strategy from Ekilex?
3. Should we support Sonaveeb's "learner mode" simplified data?
4. What languages should be prioritized for translation support?

---

## Step 2: Technical Stack Determination

### Backend Technologies

#### Language & Runtime Selection

**Decision: TypeScript with Node.js 22+**

**Justification:**
1. **Official SDK Support**: `@modelcontextprotocol/sdk` is well-maintained with TypeScript-first API
2. **Type Safety**: Zod schemas provide runtime validation matching MCP requirements
3. **Ecosystem**: Rich HTTP client libraries (fetch, axios), excellent testing tools
4. **Performance**: Adequate for I/O-bound dictionary lookups
5. **Developer Experience**: Modern ESM support, fast iteration
6. **Deployment**: Simple containerization, wide hosting support

**Alternatives Considered:**
- Python: Good SDK but TypeScript has better MCP tooling maturity
- Go/Rust: Overkill for API proxy server; longer development time

#### Framework Selection

**Decision: No framework (SDK + Express for HTTP transport)**

**Justification:**
- MCP SDK handles protocol complexity
- Express only needed for HTTP transport endpoint
- Minimal dependencies reduce maintenance burden
- FastMCP considered but adds abstraction layer we don't need

#### HTTP Client

**Decision: Native fetch (Node.js 22+)**

**Justification:**
- Built-in, no additional dependencies
- Supports AbortController for timeouts
- Modern async/await API

### Database & Storage

**Decision: No database required**

**Justification:**
- Pure proxy to Ekilex API
- Configuration via environment variables
- Optional response caching in future (Redis/memory)

**Future Enhancement:**
- In-memory LRU cache for frequent lookups
- Redis for distributed deployments

### Infrastructure & DevOps

#### Hosting Strategy

**Development**: Local Node.js / Docker
**Production**:
- Primary: Docker container (works anywhere)
- Options: Railway, Fly.io, AWS Lambda, Cloud Run

#### Container Strategy

**Decision: Docker with multi-stage build**

```dockerfile
# Build stage
FROM node:22-alpine AS builder
# Production stage
FROM node:22-alpine AS production
```

#### CI/CD Pipeline

**Decision: GitHub Actions**

Workflow stages:
1. Lint (ESLint)
2. Type check (tsc --noEmit)
3. Unit tests (Vitest)
4. Integration tests (Vitest)
5. Build
6. Docker image build
7. Publish (npm, Docker Hub)

### Local Development & DX

#### Local Environment

**Decision: Native Node.js with optional DevContainer**

**Setup:**
- Node.js 22+ (native TypeScript via --experimental-strip-types or tsx)
- pnpm for package management
- Vitest for testing (fast, native ESM)
- ESLint + Prettier for code quality

**Environment Variables:**
```env
EKILEX_API_KEY=your_api_key
EKILEX_BASE_URL=https://ekilex.eki.ee
MCP_TRANSPORT=stdio|http
MCP_HTTP_PORT=3000
LOG_LEVEL=info|debug|error
```

#### Mocking Strategy

- Mock Ekilex API responses for unit tests
- Use recorded responses for integration tests
- No need for database mocking

#### Feedback Loop Optimization

- Vitest watch mode for instant test feedback
- tsx for TypeScript execution without build step
- Hot reload via nodemon for HTTP transport development

### Security & Authentication

#### Authentication Strategy

**MCP Client Authentication**: Not required (local MCP model)

**Ekilex API Authentication**: API key passed via configuration
- Stored in environment variables
- Never exposed in MCP responses
- Validated on server startup

#### Secrets Management

- Environment variables for local development
- Docker secrets for containerized deployment
- Cloud provider secrets managers for production (AWS Secrets Manager, etc.)

### Testing Tools & Frameworks

| Category | Tool | Justification |
|----------|------|---------------|
| Unit Testing | Vitest | Native ESM, fast, TypeScript support |
| Integration Testing | Vitest | Consistent with unit tests |
| Mocking | vitest mocks | Built-in, no additional deps |
| Coverage | c8/Vitest | Native V8 coverage |
| Type Checking | TypeScript | Compile-time safety |
| Linting | ESLint 9+ | Flat config, TypeScript support |
| Formatting | Prettier | Industry standard |
| API Testing | Vitest + fetch mocks | Test MCP tool handlers |
| E2E Testing | MCP Inspector | Official debugging tool |

#### Test Coverage Requirements

| Component | Coverage Target |
|-----------|----------------|
| Tool handlers | 80% |
| API client | 80% |
| Response parsing | 90% |
| Error handling | 85% |
| Configuration | 70% |

### Trade-off Analysis

#### TypeScript vs Python

| Factor | TypeScript | Python |
|--------|------------|--------|
| SDK Maturity | Excellent | Good |
| Type Safety | Superior | Adequate (with hints) |
| Testing DX | Excellent (Vitest) | Good (pytest) |
| Deployment | Excellent | Good |
| Ecosystem | Excellent | Excellent |
| **Decision** | **Selected** | - |

#### FastMCP vs Official SDK

| Factor | FastMCP | Official SDK |
|--------|---------|--------------|
| Abstraction | High-level | Low-level |
| Flexibility | Limited | Full |
| Learning Curve | Lower | Moderate |
| Documentation | Community | Official |
| Maintenance | Third-party | Anthropic |
| **Decision** | - | **Selected** |

### Cost Projections

**Development:**
- Infrastructure: $0 (local development)
- Ekilex API: Free tier

**Production (MVP):**
- Railway/Fly.io: ~$5-10/month
- Docker Hub: Free tier
- GitHub Actions: Free tier (public repo)

**Production (Scale):**
- Container hosting: $20-50/month
- Redis caching (optional): $10-20/month
- Monitoring (Sentry): $26/month

---

## Step 3: Detailed Implementation Plan

### 3.1 System Architecture

#### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Client Layer                         │
│  (Claude Desktop, Cursor, VS Code, ChatGPT, Custom Apps)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol (JSON-RPC 2.0)
                              │
                    ┌─────────▼─────────┐
                    │    Transport       │
                    │  (stdio / HTTP)    │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                     Ekilex MCP Server                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    MCP Server Core                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │    Tools    │  │  Resources  │  │   Prompts   │     │  │
│  │  │             │  │             │  │ (Optional)  │     │  │
│  │  └──────┬──────┘  └──────┬──────┘  └─────────────┘     │  │
│  └─────────┼────────────────┼───────────────────────────────┘  │
│            │                │                                   │
│  ┌─────────▼────────────────▼───────────────────────────────┐  │
│  │                 Ekilex API Client                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │  HTTP       │  │  Response   │  │   Error     │       │  │
│  │  │  Client     │  │  Parser     │  │  Handler    │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  └────────────────────────────────────────────────────────────┘  │
│            │                                                    │
│  ┌─────────▼───────────────────────────────────────────────┐   │
│  │              Configuration Manager                       │   │
│  │  (API Keys, Base URLs, Timeouts, Logging)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
                    ┌─────────▼─────────┐
                    │   Ekilex API      │
                    │ (ekilex.eki.ee)   │
                    └───────────────────┘
```

#### Component Design

**1. MCP Server Core**
- Handles protocol negotiation
- Registers tools and resources
- Routes requests to handlers
- Manages transport connections

**2. Tools Module**
- `search_word`: Word search with wildcard support
- `get_word_details`: Complete word information
- `search_meaning`: Semantic meaning search
- `get_meaning_details`: Meaning information
- `list_datasets`: Available dictionaries
- `get_classifiers`: POS, morphology, domain info
- `get_domains`: Domain classifications

**3. Resources Module**
- `ekilex://datasets`: List of available datasets
- `ekilex://classifiers/{name}`: Classifier data
- `ekilex://domains`: Domain hierarchy

**4. Ekilex API Client**
- HTTP request handling
- Authentication header injection
- Response parsing and validation
- Error transformation

**5. Configuration Manager**
- Environment variable loading
- Validation of required settings
- Runtime configuration access

#### Communication Protocols

**MCP ↔ Server**: JSON-RPC 2.0 over stdio or HTTP
**Server ↔ Ekilex**: HTTPS REST API

#### Infrastructure Architecture

```
Development:
┌──────────────┐     ┌──────────────┐
│   Developer  │────▶│  Local Node  │────▶ Ekilex API
│   Machine    │     │   Server     │
└──────────────┘     └──────────────┘

Production (Docker):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  MCP Client  │────▶│   Docker     │────▶│  Ekilex API  │
│              │     │  Container   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

#### Resilience & Reliability

1. **Timeout Handling**: 30-second default for Ekilex requests
2. **Retry Logic**: Exponential backoff for transient failures
3. **Circuit Breaker**: Fail fast if Ekilex is consistently unavailable
4. **Graceful Degradation**: Return cached data if available during outages
5. **Health Checks**: `/health` endpoint for HTTP transport

### 3.2 Data Architecture

#### Data Flow

```
User Query → MCP Client → MCP Server → Ekilex API
                                          ↓
                                    JSON Response
                                          ↓
User ← MCP Client ← MCP Server ← Parsed/Formatted Data
```

#### Response Data Structures

**Word Search Result:**
```typescript
interface WordSearchResult {
  wordId: number;
  word: string;
  language: string;
  morphCode?: string;
  datasets: string[];
}
```

**Word Details:**
```typescript
interface WordDetails {
  wordId: number;
  word: string;
  language: string;
  morphologicalForms: MorphForm[];
  meanings: Meaning[];
  examples: Example[];
  collocations: Collocation[];
  relatedWords: RelatedWord[];
}

interface Meaning {
  meaningId: number;
  definition: string;
  domain?: string;
  register?: string;
  translations: Translation[];
}
```

#### Data Validation

- Zod schemas for all API responses
- Graceful handling of missing optional fields
- Type coercion for inconsistent API responses

#### Data Security

1. **No PII Handling**: Dictionary data only
2. **API Key Protection**: Never expose in responses or logs
3. **Attribution**: Include CC BY 4.0 notice in documentation

### 3.3 API Architecture (MCP Tools)

#### Tool Specifications

**1. search_word**
```typescript
{
  name: "search_word",
  description: "Search for Estonian words in the Ekilex dictionary. Supports wildcards: * (any characters) and ? (single character). Returns matching words with basic info.",
  inputSchema: {
    query: z.string().describe("Word to search for (supports * and ? wildcards)"),
    datasets: z.string().optional().describe("Comma-separated dataset codes to search in"),
    limit: z.number().optional().default(20).describe("Maximum results to return")
  },
  outputSchema: {
    words: z.array(WordSearchResult),
    totalCount: z.number()
  }
}
```

**2. get_word_details**
```typescript
{
  name: "get_word_details",
  description: "Get complete details for a word including definitions, morphological forms, examples, and translations. Use after search_word to get full information.",
  inputSchema: {
    wordId: z.number().describe("Word ID from search_word results"),
    datasets: z.string().optional().describe("Filter to specific datasets")
  }
}
```

**3. search_meaning**
```typescript
{
  name: "search_meaning",
  description: "Search for words by semantic meaning. Useful when you know what concept you're looking for but not the exact word.",
  inputSchema: {
    query: z.string().describe("Meaning/concept to search for"),
    datasets: z.string().optional()
  }
}
```

**4. get_meaning_details**
```typescript
{
  name: "get_meaning_details",
  description: "Get detailed information about a specific meaning including all words associated with it.",
  inputSchema: {
    meaningId: z.number().describe("Meaning ID from search results")
  }
}
```

**5. list_datasets**
```typescript
{
  name: "list_datasets",
  description: "List all available dictionary datasets in Ekilex. Use this to discover which dictionaries to search in.",
  inputSchema: {}
}
```

**6. get_classifiers**
```typescript
{
  name: "get_classifiers",
  description: "Get classifier values for filtering searches. Types: POS (parts of speech), MORPH (morphology), DOMAIN (subject areas), REGISTER (formal/informal).",
  inputSchema: {
    type: z.enum(["POS", "MORPH", "DOMAIN", "REGISTER", "DERIV", "VALUE_STATE"]).describe("Classifier type")
  }
}
```

#### Error Response Format

```typescript
{
  isError: true,
  content: [{
    type: "text",
    text: "Error: [Descriptive message with actionable guidance]"
  }]
}
```

**Error Types:**
- `API_KEY_INVALID`: "Your Ekilex API key is invalid. Please check configuration."
- `WORD_NOT_FOUND`: "No words found matching '[query]'. Try using wildcards (*) or checking spelling."
- `RATE_LIMITED`: "Ekilex API rate limit reached. Please wait before retrying."
- `EKILEX_UNAVAILABLE`: "Ekilex API is temporarily unavailable. Please try again later."

### 3.4 Frontend Architecture

**Not applicable** - This is a backend MCP server with no frontend.

Client integration examples will be provided in documentation:
- Claude Desktop configuration
- Cursor setup
- VS Code MCP extension
- Custom TypeScript/Python clients

### 3.5 Testing Strategy & TDD

#### TDD Implementation Approach

**Red-Green-Refactor Cycle:**
1. **Red**: Write failing test defining expected behavior
2. **Green**: Implement minimal code to pass test
3. **Refactor**: Improve code while maintaining green tests

#### TDD Requirements by Component

**Mandatory TDD (80%+ coverage):**
- Tool handlers (`src/tools/*.ts`)
- Ekilex API client (`src/api/`)
- Response parsing (`src/parsers/`)
- Configuration loading (`src/config/`)
- Error handling (`src/errors/`)

**TDD Recommended (70%+ coverage):**
- Transport setup
- Utility functions

#### Testing Pyramid

```
          ┌───────────────┐
          │     E2E       │  MCP Inspector manual testing
          │    Tests      │
          └───────┬───────┘
                  │
        ┌─────────▼─────────┐
        │   Integration     │  Test tool → API client → mock Ekilex
        │      Tests        │
        └─────────┬─────────┘
                  │
    ┌─────────────▼─────────────┐
    │        Unit Tests         │  Isolated handler/parser testing
    │                           │
    └───────────────────────────┘
```

#### Unit Test Examples

**Tool Handler Test (TDD):**
```typescript
// RED: Write failing test first
describe('search_word tool', () => {
  it('should return word results for valid query', async () => {
    // Arrange
    const mockClient = createMockEkilexClient({
      searchWord: vi.fn().mockResolvedValue({
        words: [{ wordId: 1, word: 'tere', language: 'est' }],
        totalCount: 1
      })
    });

    const handler = createSearchWordHandler(mockClient);

    // Act
    const result = await handler({ query: 'tere' });

    // Assert
    expect(result.content[0].text).toContain('tere');
    expect(mockClient.searchWord).toHaveBeenCalledWith('tere', undefined);
  });

  it('should handle wildcard queries', async () => {
    const mockClient = createMockEkilexClient({
      searchWord: vi.fn().mockResolvedValue({
        words: [
          { wordId: 1, word: 'tere', language: 'est' },
          { wordId: 2, word: 'tervis', language: 'est' }
        ],
        totalCount: 2
      })
    });

    const handler = createSearchWordHandler(mockClient);
    const result = await handler({ query: 'ter*' });

    expect(result.content[0].text).toContain('2 results');
  });

  it('should return helpful message when no results found', async () => {
    const mockClient = createMockEkilexClient({
      searchWord: vi.fn().mockResolvedValue({ words: [], totalCount: 0 })
    });

    const handler = createSearchWordHandler(mockClient);
    const result = await handler({ query: 'xyznotaword' });

    expect(result.content[0].text).toContain('No words found');
    expect(result.content[0].text).toContain('wildcard');
  });
});
```

**API Client Test (TDD):**
```typescript
describe('EkilexApiClient', () => {
  it('should include API key header in requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    });

    const client = new EkilexApiClient({
      apiKey: 'test-key',
      baseUrl: 'https://ekilex.eki.ee',
      fetch: fetchMock
    });

    await client.searchWord('test');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'ekilex-api-key': 'test-key'
        })
      })
    );
  });

  it('should throw EkilexApiError on non-200 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    const client = new EkilexApiClient({
      apiKey: 'invalid-key',
      baseUrl: 'https://ekilex.eki.ee',
      fetch: fetchMock
    });

    await expect(client.searchWord('test'))
      .rejects.toThrow(EkilexApiError);
  });
});
```

#### Integration Test Examples

```typescript
describe('MCP Server Integration', () => {
  let server: McpServer;
  let client: TestMcpClient;

  beforeEach(async () => {
    server = createServer({
      ekilexClient: createMockEkilexClient()
    });
    client = await createTestClient(server);
  });

  it('should list tools correctly', async () => {
    const tools = await client.listTools();

    expect(tools).toContainEqual(
      expect.objectContaining({ name: 'search_word' })
    );
    expect(tools).toContainEqual(
      expect.objectContaining({ name: 'get_word_details' })
    );
  });

  it('should execute search_word tool', async () => {
    const result = await client.callTool('search_word', { query: 'tere' });

    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });
});
```

#### Test Environment Strategy

**Test Data Management:**
```typescript
// test/fixtures/ekilex-responses.ts
export const mockWordSearchResponse = {
  success: true,
  data: [
    { wordId: 1, word: 'tere', language: 'est' },
    { wordId: 2, word: 'tervitama', language: 'est' }
  ]
};

export const mockWordDetailsResponse = {
  success: true,
  data: {
    wordId: 1,
    word: 'tere',
    meanings: [
      { meaningId: 1, definition: 'greeting' }
    ]
  }
};
```

**Mock Factory:**
```typescript
// test/helpers/mock-ekilex-client.ts
export function createMockEkilexClient(overrides = {}) {
  return {
    searchWord: vi.fn().mockResolvedValue({ words: [], totalCount: 0 }),
    getWordDetails: vi.fn().mockResolvedValue(null),
    searchMeaning: vi.fn().mockResolvedValue({ meanings: [] }),
    listDatasets: vi.fn().mockResolvedValue([]),
    getClassifiers: vi.fn().mockResolvedValue([]),
    ...overrides
  };
}
```

#### CI/CD Test Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:coverage

      - name: Check coverage thresholds
        run: |
          pnpm test:coverage --coverage.thresholds.lines=80
          pnpm test:coverage --coverage.thresholds.branches=70
```

#### Test Coverage Requirements

| Component | Line Coverage | Branch Coverage |
|-----------|---------------|-----------------|
| Tool handlers | 80% | 70% |
| API client | 85% | 75% |
| Response parsers | 90% | 80% |
| Error handling | 85% | 75% |
| Configuration | 70% | 60% |
| **Overall** | **80%** | **70%** |

#### Quality Assurance Process

**Code Review Requirements:**
- All PRs require 1 approval
- Tests must pass in CI
- Coverage must not decrease
- New code must include tests

**Automated Quality Checks:**
- ESLint with TypeScript rules
- Prettier formatting
- TypeScript strict mode
- Vitest coverage gates

#### Test Bypassing Policy

Tests **CANNOT** be bypassed except:
1. Written approval from project maintainer
2. Documented justification in PR
3. Time-bound exemption with remediation plan
4. Remediation issue created

Test skipping is **NEVER** allowed for:
- Tool handler logic
- API client authentication
- Response parsing
- Error handling

### 3.6 Error Handling & Edge Cases

#### Error Scenarios

| Scenario | Detection | Response | Recovery |
|----------|-----------|----------|----------|
| Invalid API key | 401 response | Clear message with setup instructions | User reconfigures |
| Word not found | Empty results | Helpful message with wildcard suggestion | User retries |
| Ekilex timeout | Request timeout | Retry message | Auto-retry with backoff |
| Ekilex down | Connection error | Service unavailable message | Wait and retry |
| Rate limited | 429 response | Rate limit message with wait time | Exponential backoff |
| Invalid parameters | Zod validation | Validation error message | User corrects input |
| Malformed response | Parse error | Internal error logged, generic message | Alert developers |

#### Edge Cases

1. **Empty search results**: Return helpful message suggesting wildcards
2. **Very large result sets**: Paginate, limit default to 20
3. **Unicode handling**: Estonian characters (õ, ä, ö, ü) properly encoded
4. **Timeout during request**: Abort and return clear error
5. **Concurrent requests**: Handle gracefully (Node.js async)
6. **Missing optional fields**: Zod optional with defaults

### 3.7 Security Implementation

#### Application Security

1. **Input Validation**: All tool inputs validated via Zod schemas
2. **API Key Security**:
   - Loaded from environment only
   - Never logged or returned in responses
   - Validated on server startup
3. **No User Data**: No PII or sensitive data handled
4. **Output Sanitization**: Dictionary data returned as-is (trusted source)

#### Configuration Security

```typescript
// Secure configuration loading
function loadConfig(): Config {
  const apiKey = process.env.EKILEX_API_KEY;

  if (!apiKey) {
    throw new ConfigurationError(
      'EKILEX_API_KEY environment variable is required'
    );
  }

  // Validate API key format (if known)
  if (apiKey.length < 20) {
    console.warn('API key appears short - verify configuration');
  }

  return {
    apiKey,
    baseUrl: process.env.EKILEX_BASE_URL || 'https://ekilex.eki.ee',
    timeout: parseInt(process.env.EKILEX_TIMEOUT || '30000', 10)
  };
}
```

#### Security Monitoring

- Log authentication failures (without exposing key)
- Monitor for unusual request patterns
- Alert on repeated errors

### 3.8 Operational Considerations

#### Monitoring & Observability

**Key Metrics:**
- Request count by tool
- Response latency (p50, p95, p99)
- Error rate by type
- Ekilex API response times

**Logging Strategy:**
```typescript
// Structured logging
logger.info('Tool called', {
  tool: 'search_word',
  query: params.query,
  datasets: params.datasets,
  duration: responseTime
});

logger.error('Ekilex API error', {
  tool: 'get_word_details',
  wordId: params.wordId,
  error: error.message,
  statusCode: error.statusCode
});
```

#### Deployment Strategy

**Local/Development:**
```bash
# stdio transport (default)
node --experimental-strip-types src/index.ts

# HTTP transport
MCP_TRANSPORT=http MCP_HTTP_PORT=3000 node --experimental-strip-types src/index.ts
```

**Production (Docker):**
```bash
docker build -t ekilex-mcp .
docker run -e EKILEX_API_KEY=xxx ekilex-mcp
```

**MCP Client Configuration:**
```json
{
  "mcpServers": {
    "ekilex": {
      "command": "npx",
      "args": ["-y", "ekilex-mcp"],
      "env": {
        "EKILEX_API_KEY": "${EKILEX_API_KEY}"
      }
    }
  }
}
```

#### Health Check

```typescript
// HTTP transport health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: packageJson.version,
    ekilexConfigured: !!config.apiKey
  });
});
```

### 3.9 Implementation Phases

#### Phase 0: Foundation & Testing Infrastructure (TDD MANDATORY)

**Goal:** Complete development environment with enforced testing

**Prerequisites:** None

**Deliverables:**
- [ ] Repository structure created
- [ ] TypeScript/ESM configuration
- [ ] Vitest testing framework setup
- [ ] ESLint + Prettier configuration
- [ ] GitHub Actions CI pipeline
- [ ] Coverage reporting configured
- [ ] Development documentation

**Components:**
```
ekilex-mcp/
├── src/
│   └── index.ts          # Entry point stub
├── test/
│   └── setup.ts          # Test setup
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── .prettierrc
```

**Test Coverage Goals:** N/A (infrastructure only)

**Acceptance Criteria:**
- [ ] `pnpm test` runs successfully
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] CI pipeline runs on push
- [ ] Coverage reporting works

**Complexity:** Low
**Risk:** Low

---

#### Phase 1: Walking Skeleton - Vertical Slice (TDD MANDATORY)

**Goal:** End-to-end path: MCP Client → Server → Ekilex API

**Prerequisites:** Phase 0 complete

**Deliverables:**
- [ ] MCP server initialization
- [ ] Single tool (`search_word`) working
- [ ] Ekilex API client (search endpoint only)
- [ ] stdio transport functional
- [ ] Basic error handling

**TDD Requirements:**
1. Write tests BEFORE implementation
2. Test Ekilex API client with mocked fetch
3. Test tool handler with mocked client
4. Test MCP server integration

**Test-First Development Order:**
```
1. test/api/ekilex-client.test.ts → src/api/ekilex-client.ts
2. test/tools/search-word.test.ts → src/tools/search-word.ts
3. test/server.test.ts → src/server.ts
4. test/integration/search-word.integration.test.ts
```

**Coverage Goals:** 80% for new code

**Acceptance Criteria:**
- [ ] ALL tests passing
- [ ] Can call `search_word` tool via MCP Inspector
- [ ] Returns real data from Ekilex
- [ ] Errors handled gracefully

**Complexity:** Medium
**Risk:** Medium (API integration unknowns)

---

#### Phase 2: Core Tools - Complete API Coverage (TDD MANDATORY)

**Goal:** All primary Ekilex tools implemented

**Prerequisites:** Phase 1 complete

**Deliverables:**
- [ ] `get_word_details` tool
- [ ] `search_meaning` tool
- [ ] `get_meaning_details` tool
- [ ] `list_datasets` tool
- [ ] `get_classifiers` tool
- [ ] `get_domains` tool
- [ ] Response parsing for all endpoints
- [ ] Comprehensive error handling

**TDD Requirements:**
- Each tool: tests first, then implementation
- Response parser tests with fixture data
- Error scenario tests

**Coverage Goals:** 80% overall

**Acceptance Criteria:**
- [ ] ALL tests passing
- [ ] All 7 tools functional
- [ ] Coverage >= 80%
- [ ] Documentation for each tool

**Complexity:** Medium
**Risk:** Low (following Phase 1 patterns)

---

#### Phase 3: HTTP Transport & Resources

**Goal:** Production-ready transports and resources

**Prerequisites:** Phase 2 complete

**Deliverables:**
- [ ] HTTP/Streamable HTTP transport
- [ ] Health check endpoint
- [ ] MCP Resources for datasets/classifiers
- [ ] Configuration validation
- [ ] Request logging

**Components:**
```typescript
// Resources
server.resource("datasets", "ekilex://datasets", ...)
server.resource("classifiers", new ResourceTemplate("ekilex://classifiers/{type}"), ...)
```

**Coverage Goals:** 75% for new code

**Acceptance Criteria:**
- [ ] HTTP transport works with curl
- [ ] Resources listable and readable
- [ ] Health endpoint returns status

**Complexity:** Medium
**Risk:** Low

---

#### Phase 4: Productionization

**Goal:** Production-ready deployment

**Prerequisites:** Phase 3 complete

**Deliverables:**
- [ ] Docker container
- [ ] npm package publishing
- [ ] GitHub Releases
- [ ] Comprehensive documentation
- [ ] Example configurations (Claude, Cursor, VS Code)
- [ ] Performance optimization
- [ ] Rate limiting / caching (if needed)

**Coverage Goals:** Maintain 80%

**Acceptance Criteria:**
- [ ] Docker image builds and runs
- [ ] npm package installable
- [ ] Documentation complete
- [ ] Example configs tested

**Complexity:** Medium
**Risk:** Low

---

#### Phase 5: Launch Preparation

**Goal:** Public release

**Prerequisites:** Phase 4 complete

**Deliverables:**
- [ ] README with full documentation
- [ ] CHANGELOG
- [ ] LICENSE (MIT)
- [ ] Contributing guide
- [ ] Security policy
- [ ] npm publish
- [ ] GitHub release
- [ ] Announcement preparation

**Acceptance Criteria:**
- [ ] `npx ekilex-mcp` works
- [ ] Documentation reviewed
- [ ] No known critical bugs

---

### 3.10 Documentation Requirements

#### Technical Documentation

1. **Architecture Decision Records (ADRs)**
   - ADR-001: TypeScript over Python
   - ADR-002: Official SDK over FastMCP
   - ADR-003: No database for MVP
   - ADR-004: stdio as primary transport

2. **API Documentation**
   - Tool specifications (in code + README)
   - Error codes and messages
   - Configuration options

3. **Deployment Guide**
   - Environment variables
   - Docker deployment
   - Cloud deployment options

#### User Documentation

1. **README.md**
   - Quick start guide
   - Installation instructions
   - Configuration
   - Example usage

2. **Client Setup Guides**
   - Claude Desktop
   - Cursor
   - VS Code
   - Custom clients

3. **Troubleshooting**
   - Common errors
   - FAQ

#### Developer Documentation

1. **Contributing Guide**
   - Development setup
   - TDD workflow
   - PR requirements

2. **Testing Guide**
   - Running tests
   - Writing new tests
   - Mocking patterns

---

## Final Deliverable Checklist

- [x] Complete research findings with sources
- [x] Justified technical stack with trade-off analysis
- [x] Detailed system architecture description
- [x] Data architecture (flow, validation, security)
- [x] Complete MCP tool specifications
- [x] Comprehensive TDD strategy with coverage requirements
- [x] Testing pyramid implementation plan
- [x] CI/CD pipeline with mandatory test gates
- [x] Test coverage monitoring strategy
- [x] Clear policy on test bypassing
- [x] Developer experience strategy
- [x] Error handling and edge cases
- [x] Security implementation details
- [x] Operational procedures
- [x] Phased implementation roadmap (vertical slicing)
- [x] Documentation requirements
- [x] Risk mitigation strategies
- [x] Assumptions and open questions documented

---

## Sources and References

### MCP Protocol
- [MCP Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Example Servers](https://modelcontextprotocol.io/examples)
- [Anthropic MCP Introduction](https://www.anthropic.com/news/model-context-protocol)

### Ekilex & Sonaveeb
- [Ekilex GitHub Repository](https://github.com/keeleinstituut/ekilex)
- [Ekilex API Documentation](https://github.com/keeleinstituut/ekilex/wiki/Ekilex-API)
- [Sonaveeb Portal](https://sonaveeb.ee/about?uilang=en)

### Estonian NLP
- [EstNLTK GitHub](https://github.com/estnltk/estnltk)

### MCP Development
- [freeCodeCamp MCP TypeScript Guide](https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/)
- [FastMCP Framework](https://github.com/punkpeye/fastmcp)
- [MCP Testing Guide](https://mcpcat.io/guides/writing-unit-tests-mcp-servers/)

### Translation MCP Servers (Reference)
- [DeepL MCP Server](https://github.com/DeepLcom/deepl-mcp-server)
- [Lara Translate MCP](https://github.com/translated/lara-mcp)

### Security
- [MCP Authorization Specification](https://modelcontextprotocol.io/specification/draft/basic/authorization)
- [MCP API Key Best Practices](https://www.stainless.com/mcp/mcp-server-api-key-management-best-practices)
