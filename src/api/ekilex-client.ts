import { z } from 'zod';
import type { Config } from '../config/index.js';
import {
  EkilexApiError,
  InvalidApiKeyError,
  RateLimitError,
  ServiceUnavailableError,
  TimeoutError,
} from '../errors.js';
import {
  type WordSearchResult,
  type WordDetails,
  type Dataset,
  type Classifier,
  type Domain,
  type MeaningSearchResult,
  WordSearchResultSchema,
  WordDetailsSchema,
  DatasetSchema,
  ClassifierSchema,
  DomainSchema,
  MeaningSearchResultSchema,
  EkilexResponseSchema,
} from '../types/index.js';

/**
 * Options for creating an Ekilex API client
 */
export interface EkilexClientOptions {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  /** Optional fetch implementation for testing */
  fetch?: typeof globalThis.fetch;
}

/**
 * Client for interacting with the Ekilex API
 */
export class EkilexApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: EkilexClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /**
   * Create a client from Config
   */
  static fromConfig(config: Config): EkilexApiClient {
    return new EkilexApiClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeout: config.timeout,
    });
  }

  /**
   * Make a request to the Ekilex API
   */
  private async request<T>(
    endpoint: string,
    schema: z.ZodType<T>
  ): Promise<T | undefined> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          'ekilex-api-key': this.apiKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const json: unknown = await response.json();
      const responseSchema = EkilexResponseSchema(schema);
      const parsed = responseSchema.parse(json);

      if (!parsed.success) {
        throw new EkilexApiError(parsed.message ?? 'API request failed');
      }

      return parsed.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof z.ZodError) {
        throw new EkilexApiError(
          `Invalid response from Ekilex API: ${error.message}`
        );
      }

      if (error instanceof EkilexApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(this.timeout);
        }
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND')
        ) {
          throw new ServiceUnavailableError(error);
        }
      }

      throw error;
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;

    if (status === 401 || status === 403) {
      throw new InvalidApiKeyError();
    }

    if (status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
    }

    if (status >= 500) {
      throw new ServiceUnavailableError();
    }

    let message = `HTTP ${status}: ${response.statusText}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore JSON parse errors
    }

    throw new EkilexApiError(message, status);
  }

  /**
   * Search for words in Ekilex
   */
  async searchWord(
    query: string,
    datasets?: string
  ): Promise<WordSearchResult[]> {
    const endpoint = datasets
      ? `/api/word/search/${encodeURIComponent(query)}/${encodeURIComponent(datasets)}`
      : `/api/word/search/${encodeURIComponent(query)}`;

    const result = await this.request(endpoint, z.array(WordSearchResultSchema));
    return result ?? [];
  }

  /**
   * Get detailed information about a word
   */
  async getWordDetails(
    wordId: number,
    datasets?: string
  ): Promise<WordDetails | undefined> {
    const endpoint = datasets
      ? `/api/word/details/${wordId}/${encodeURIComponent(datasets)}`
      : `/api/word/details/${wordId}`;

    return this.request(endpoint, WordDetailsSchema);
  }

  /**
   * Search for meanings
   */
  async searchMeaning(
    query: string,
    datasets?: string
  ): Promise<MeaningSearchResult[]> {
    const endpoint = datasets
      ? `/api/meaning/search/${encodeURIComponent(query)}/${encodeURIComponent(datasets)}`
      : `/api/meaning/search/${encodeURIComponent(query)}`;

    const result = await this.request(endpoint, z.array(MeaningSearchResultSchema));
    return result ?? [];
  }

  /**
   * Get all available datasets
   */
  async getDatasets(): Promise<Dataset[]> {
    const result = await this.request('/api/datasets', z.array(DatasetSchema));
    return result ?? [];
  }

  /**
   * Get classifiers by type
   */
  async getClassifiers(type: string): Promise<Classifier[]> {
    const endpoint = `/api/classifiers/${encodeURIComponent(type)}`;
    const result = await this.request(endpoint, z.array(ClassifierSchema));
    return result ?? [];
  }

  /**
   * Get domains by origin
   */
  async getDomains(origin: string): Promise<Domain[]> {
    const endpoint = `/api/domains/${encodeURIComponent(origin)}`;
    const result = await this.request(endpoint, z.array(DomainSchema));
    return result ?? [];
  }

  /**
   * Get all domain origins
   */
  async getDomainOrigins(): Promise<string[]> {
    const result = await this.request('/api/domainorigins', z.array(z.string()));
    return result ?? [];
  }
}
