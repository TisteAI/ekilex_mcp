import { describe, it, expect, vi } from 'vitest';
import {
  createGetMeaningDetailsHandler,
  GetMeaningDetailsInputSchema,
} from '../../src/tools/get-meaning-details.js';
import { createMockEkilexClient, mockMeaningDetails } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('get_meaning_details tool', () => {
  describe('input validation', () => {
    it('should accept valid meaning ID', () => {
      const result = GetMeaningDetailsInputSchema.safeParse({ meaningId: 123 });
      expect(result.success).toBe(true);
    });

    it('should accept meaning ID with datasets', () => {
      const result = GetMeaningDetailsInputSchema.safeParse({
        meaningId: 123,
        datasets: 'eki,psv',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-integer meaning ID', () => {
      const result = GetMeaningDetailsInputSchema.safeParse({ meaningId: 1.5 });
      expect(result.success).toBe(false);
    });

    it('should reject negative meaning ID', () => {
      const result = GetMeaningDetailsInputSchema.safeParse({ meaningId: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject zero meaning ID', () => {
      const result = GetMeaningDetailsInputSchema.safeParse({ meaningId: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject missing meaning ID', () => {
      const result = GetMeaningDetailsInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    it('should return meaning details for valid meaning ID', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(result.content[0]?.text).toContain('Meaning');
    });

    it('should call API client with correct parameters', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      await handler({ meaningId: 123, datasets: 'eki' });

      expect(mockClient.getMeaningDetails).toHaveBeenCalledWith(123, 'eki');
    });

    it('should include definitions in output', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content[0]?.text).toContain('greeting');
    });

    it('should include related words', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content[0]?.text).toContain('tere');
      expect(result.content[0]?.text).toContain('tervitus');
    });

    it('should include domain codes when present', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content[0]?.text).toContain('everyday');
    });

    it('should include register codes when present', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content[0]?.text).toContain('informal');
    });

    it('should include notes when present', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content[0]?.text).toContain('Common greeting');
    });

    it('should return not found message when meaning does not exist', async () => {
      const mockClient = createMockEkilexClient({
        getMeaningDetails: vi.fn().mockResolvedValue(undefined),
      });
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 99999 });

      expect(result.content[0]?.text).toContain('No meaning found');
      expect(result.content[0]?.text).toContain('99999');
      expect(result.content[0]?.text).toContain('search_meaning');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        getMeaningDetails: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createGetMeaningDetailsHandler(mockClient);

      const result = await handler({ meaningId: 1 });

      expect(result.content[0]?.text).toContain('Error');
    });
  });
});
