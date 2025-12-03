import { describe, it, expect, vi } from 'vitest';
import {
  createGetDomainsHandler,
  GetDomainsInputSchema,
  DOMAIN_ORIGINS,
} from '../../src/tools/get-domains.js';
import { createMockEkilexClient, mockDomains } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('get_domains tool', () => {
  describe('input validation', () => {
    it('should accept valid origin', () => {
      const result = GetDomainsInputSchema.safeParse({ origin: 'eki' });
      expect(result.success).toBe(true);
    });

    it('should accept origin with list_origins flag', () => {
      const result = GetDomainsInputSchema.safeParse({
        origin: 'eki',
        listOrigins: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty origin when listing origins', () => {
      const result = GetDomainsInputSchema.safeParse({ listOrigins: true });
      expect(result.success).toBe(true);
    });

    it('should accept missing origin (handler validates)', () => {
      const result = GetDomainsInputSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject empty string for origin', () => {
      const result = GetDomainsInputSchema.safeParse({ origin: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution - get domains', () => {
    it('should return domains for valid origin', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ origin: 'eki' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(result.content[0]?.text).toContain('domain');
    });

    it('should call API client with correct origin', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetDomainsHandler(mockClient);

      await handler({ origin: 'eki' });

      expect(mockClient.getDomains).toHaveBeenCalledWith('eki');
    });

    it('should include domain codes in output', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ origin: 'eki' });

      expect(result.content[0]?.text).toContain('med');
      expect(result.content[0]?.text).toContain('law');
    });

    it('should include domain values in output', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ origin: 'eki' });

      expect(result.content[0]?.text).toContain('medicine');
      expect(result.content[0]?.text).toContain('law');
    });

    it('should return empty message when no domains found', async () => {
      const mockClient = createMockEkilexClient({
        getDomains: vi.fn().mockResolvedValue([]),
      });
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ origin: 'unknown' });

      expect(result.content[0]?.text).toContain('No domains found');
    });

    it('should return helpful message when origin is missing', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('provide an origin');
      expect(result.content[0]?.text).toContain('listOrigins');
    });
  });

  describe('handler execution - list origins', () => {
    it('should list domain origins when listOrigins is true', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ listOrigins: true });

      expect(mockClient.getDomainOrigins).toHaveBeenCalled();
      expect(result.content[0]?.text).toContain('eki');
      expect(result.content[0]?.text).toContain('lenoch');
    });

    it('should return message when no origins found', async () => {
      const mockClient = createMockEkilexClient({
        getDomainOrigins: vi.fn().mockResolvedValue([]),
      });
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ listOrigins: true });

      expect(result.content[0]?.text).toContain('No domain origins');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        getDomains: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ origin: 'eki' });

      expect(result.content[0]?.text).toContain('Error');
    });

    it('should return error message when listing origins fails', async () => {
      const mockClient = createMockEkilexClient({
        getDomainOrigins: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createGetDomainsHandler(mockClient);

      const result = await handler({ listOrigins: true });

      expect(result.content[0]?.text).toContain('Error');
    });
  });

  describe('constants', () => {
    it('should export common domain origins', () => {
      expect(DOMAIN_ORIGINS).toBeDefined();
      expect(Array.isArray(DOMAIN_ORIGINS)).toBe(true);
      expect(DOMAIN_ORIGINS.length).toBeGreaterThan(0);
    });
  });
});
