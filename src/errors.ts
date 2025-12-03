/**
 * Base error class for Ekilex MCP server errors
 */
export class EkilexMcpError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'EkilexMcpError';
  }
}

/**
 * Error thrown when the Ekilex API returns an error
 */
export class EkilexApiError extends EkilexMcpError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(message, 'EKILEX_API_ERROR');
    this.name = 'EkilexApiError';
  }
}

/**
 * Error thrown when the API key is invalid
 */
export class InvalidApiKeyError extends EkilexMcpError {
  constructor() {
    super(
      'Your Ekilex API key is invalid. Please check your EKILEX_API_KEY configuration.',
      'API_KEY_INVALID'
    );
    this.name = 'InvalidApiKeyError';
  }
}

/**
 * Error thrown when rate limited by Ekilex API
 */
export class RateLimitError extends EkilexMcpError {
  constructor(public readonly retryAfter?: number) {
    super(
      `Ekilex API rate limit reached. ${retryAfter ? `Please wait ${retryAfter} seconds before retrying.` : 'Please wait before retrying.'}`,
      'RATE_LIMITED'
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when Ekilex API is unavailable
 */
export class ServiceUnavailableError extends EkilexMcpError {
  constructor(cause?: Error) {
    super('Ekilex API is temporarily unavailable. Please try again later.', 'EKILEX_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Error thrown when a request times out
 */
export class TimeoutError extends EkilexMcpError {
  constructor(timeoutMs: number) {
    super(`Request to Ekilex API timed out after ${timeoutMs}ms`, 'TIMEOUT');
    this.name = 'TimeoutError';
  }
}

/**
 * Error thrown when no results are found
 */
export class NotFoundError extends EkilexMcpError {
  constructor(query: string, entityType = 'word') {
    super(
      `No ${entityType}s found matching '${query}'. Try using wildcards (*) or checking spelling.`,
      'NOT_FOUND'
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Format an error for MCP tool response
 */
export function formatErrorForMcp(error: unknown): { type: 'text'; text: string } {
  if (error instanceof EkilexMcpError) {
    return {
      type: 'text',
      text: `Error [${error.code}]: ${error.message}`,
    };
  }

  if (error instanceof Error) {
    return {
      type: 'text',
      text: `Error: ${error.message}`,
    };
  }

  return {
    type: 'text',
    text: 'An unexpected error occurred.',
  };
}
