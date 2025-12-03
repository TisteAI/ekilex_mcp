import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EkilexApiClient } from '../../src/api/ekilex-client.js';
import {
  InvalidApiKeyError,
  RateLimitError,
  ServiceUnavailableError,
  TimeoutError,
} from '../../src/errors.js';
import { mockWordSearchResults, mockWordDetails, mockDatasets } from '../helpers/mock-ekilex-client.js';

describe('EkilexApiClient', () => {
  const defaultOptions = {
    apiKey: 'test-api-key',
    baseUrl: 'https://ekilex.eki.ee',
    timeout: 30000,
  };

  describe('constructor', () => {
    it('should create client with provided options', () => {
      const client = new EkilexApiClient(defaultOptions);
      expect(client).toBeInstanceOf(EkilexApiClient);
    });

    it('should remove trailing slash from base URL', () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        baseUrl: 'https://ekilex.eki.ee/',
        fetch: fetchMock,
      });

      void client.searchWord('test');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/word/search/test',
        expect.any(Object)
      );
    });
  });

  describe('request headers', () => {
    it('should include API key header in requests', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.searchWord('test');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'ekilex-api-key': 'test-api-key',
            Accept: 'application/json',
          }),
        })
      );
    });
  });

  describe('searchWord', () => {
    it('should return word search results for valid query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockWordSearchResults }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.searchWord('tere');

      expect(results).toHaveLength(2);
      expect(results[0]?.wordValue).toBe('tere');
      expect(results[1]?.wordValue).toBe('tervis');
    });

    it('should preserve wildcards in query parameter', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      // Wildcards (* and ?) should be preserved for Ekilex API
      await client.searchWord('ter*');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/word/search/ter*',
        expect.any(Object)
      );
    });

    it('should encode special characters in query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      // Spaces and other special chars should be encoded
      await client.searchWord('tere päev');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/word/search/tere%20p%C3%A4ev',
        expect.any(Object)
      );
    });

    it('should include datasets in URL when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.searchWord('tere', 'eki,psv');

      // Commas are encoded by encodeURIComponent
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/api\/word\/search\/tere\/eki.*psv/),
        expect.any(Object)
      );
    });

    it('should return empty array when no results', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.searchWord('xyznotaword');

      expect(results).toEqual([]);
    });
  });

  describe('getWordDetails', () => {
    it('should return word details for valid word ID', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockWordDetails }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const result = await client.getWordDetails(1);

      expect(result).toBeDefined();
      expect(result?.wordId).toBe(1);
      expect(result?.wordValue).toBe('tere');
    });

    it('should include datasets in URL when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockWordDetails }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.getWordDetails(1, 'eki');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/word/details/1/eki',
        expect.any(Object)
      );
    });
  });

  describe('getDatasets', () => {
    it('should return list of datasets', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockDatasets }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getDatasets();

      expect(results).toHaveLength(2);
      expect(results[0]?.code).toBe('eki');
    });
  });

  describe('error handling', () => {
    it('should throw InvalidApiKeyError on 401 response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid API key' }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await expect(client.searchWord('test')).rejects.toThrow(InvalidApiKeyError);
    });

    it('should throw InvalidApiKeyError on 403 response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Access denied' }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await expect(client.searchWord('test')).rejects.toThrow(InvalidApiKeyError);
    });

    it('should throw RateLimitError on 429 response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '60' }),
        json: async () => ({ message: 'Rate limit exceeded' }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await expect(client.searchWord('test')).rejects.toThrow(RateLimitError);
    });

    it('should throw ServiceUnavailableError on 500 response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await expect(client.searchWord('test')).rejects.toThrow(ServiceUnavailableError);
    });

    it('should throw TimeoutError when request times out', async () => {
      const fetchMock = vi.fn().mockImplementation(async (_url: string, options: RequestInit) => {
        // Wait longer than timeout
        await new Promise((_, reject) => {
          options.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        timeout: 100,
        fetch: fetchMock,
      });

      await expect(client.searchWord('test')).rejects.toThrow(TimeoutError);
    }, 5000);

    it('should throw ServiceUnavailableError on connection refused', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await expect(client.searchWord('test')).rejects.toThrow(ServiceUnavailableError);
    });
  });
});
