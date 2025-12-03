import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EkilexApiClient } from '../../src/api/ekilex-client.js';
import {
  InvalidApiKeyError,
  RateLimitError,
  ServiceUnavailableError,
  TimeoutError,
} from '../../src/errors.js';
import {
  mockWordSearchResults,
  mockWordDetails,
  mockDatasets,
  mockMeaningSearchResults,
  mockMeaningDetails,
  mockClassifiers,
  mockDomains,
} from '../helpers/mock-ekilex-client.js';
import { loadConfig } from '../../src/config/index.js';

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

  describe('searchMeaning', () => {
    it('should return meaning search results for valid query', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockMeaningSearchResults }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.searchMeaning('greeting');

      expect(results).toHaveLength(1);
      expect(results[0]?.meaningId).toBe(1);
      expect(results[0]?.definition).toBe('A greeting');
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

      await client.searchMeaning('greeting', 'eki,psv');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/api\/meaning\/search\/greeting\/eki.*psv/),
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

      const results = await client.searchMeaning('nonexistent');

      expect(results).toEqual([]);
    });
  });

  describe('getMeaningDetails', () => {
    it('should return meaning details for valid meaning ID', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockMeaningDetails }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const result = await client.getMeaningDetails(1);

      expect(result).toBeDefined();
      expect(result?.meaningId).toBe(1);
      expect(result?.definitions).toHaveLength(2);
    });

    it('should include datasets in URL when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockMeaningDetails }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.getMeaningDetails(1, 'eki');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/meaning/details/1/eki',
        expect.any(Object)
      );
    });

    it('should return undefined when meaning not found', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: undefined }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const result = await client.getMeaningDetails(99999);

      expect(result).toBeUndefined();
    });
  });

  describe('getClassifiers', () => {
    it('should return classifiers for valid type', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockClassifiers }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getClassifiers('POS');

      expect(results).toHaveLength(3);
      expect(results[0]?.code).toBe('S');
      expect(results[0]?.value).toBe('noun');
    });

    it('should encode classifier type in URL', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.getClassifiers('VALUE_STATE');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/classifiers/VALUE_STATE',
        expect.any(Object)
      );
    });

    it('should return empty array when no classifiers found', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getClassifiers('UNKNOWN');

      expect(results).toEqual([]);
    });
  });

  describe('getDomains', () => {
    it('should return domains for valid origin', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockDomains }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getDomains('eki');

      expect(results).toHaveLength(2);
      expect(results[0]?.code).toBe('med');
      expect(results[0]?.value).toBe('medicine');
    });

    it('should encode origin in URL', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.getDomains('lenoch');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/domains/lenoch',
        expect.any(Object)
      );
    });

    it('should return empty array when no domains found', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getDomains('unknown');

      expect(results).toEqual([]);
    });
  });

  describe('getDomainOrigins', () => {
    it('should return list of domain origins', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: ['eki', 'lenoch', 'mt'] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getDomainOrigins();

      expect(results).toHaveLength(3);
      expect(results).toContain('eki');
      expect(results).toContain('lenoch');
    });

    it('should call correct endpoint', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      await client.getDomainOrigins();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://ekilex.eki.ee/api/domainorigins',
        expect.any(Object)
      );
    });

    it('should return empty array when no origins available', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      const client = new EkilexApiClient({
        ...defaultOptions,
        fetch: fetchMock,
      });

      const results = await client.getDomainOrigins();

      expect(results).toEqual([]);
    });
  });

  describe('fromConfig', () => {
    it('should create client from config object', () => {
      const originalEnv = process.env.EKILEX_API_KEY;
      process.env.EKILEX_API_KEY = 'test-key-from-config';

      try {
        const config = loadConfig();
        const client = EkilexApiClient.fromConfig(config);

        expect(client).toBeInstanceOf(EkilexApiClient);
      } finally {
        if (originalEnv !== undefined) {
          process.env.EKILEX_API_KEY = originalEnv;
        } else {
          delete process.env.EKILEX_API_KEY;
        }
      }
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
