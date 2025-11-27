import { describe, it, expect, vi } from 'vitest';
import {
  createGetWordDetailsHandler,
  GetWordDetailsInputSchema,
} from '../../src/tools/get-word-details.js';
import { createMockEkilexClient, mockWordDetails } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('get_word_details tool', () => {
  describe('input validation', () => {
    it('should accept valid word ID', () => {
      const result = GetWordDetailsInputSchema.safeParse({ wordId: 123 });
      expect(result.success).toBe(true);
    });

    it('should accept word ID with datasets', () => {
      const result = GetWordDetailsInputSchema.safeParse({
        wordId: 123,
        datasets: 'eki,psv',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-integer word ID', () => {
      const result = GetWordDetailsInputSchema.safeParse({ wordId: 1.5 });
      expect(result.success).toBe(false);
    });

    it('should reject negative word ID', () => {
      const result = GetWordDetailsInputSchema.safeParse({ wordId: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject zero word ID', () => {
      const result = GetWordDetailsInputSchema.safeParse({ wordId: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject missing word ID', () => {
      const result = GetWordDetailsInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    it('should return word details for valid word ID', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(result.content[0]?.text).toContain('tere');
    });

    it('should call API client with correct parameters', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      await handler({ wordId: 123, datasets: 'eki' });

      expect(mockClient.getWordDetails).toHaveBeenCalledWith(123, 'eki');
    });

    it('should include word value in header', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content[0]?.text).toContain('# tere');
    });

    it('should include language information', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content[0]?.text).toContain('Language: est');
    });

    it('should include morphological forms', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content[0]?.text).toContain('Morphological Forms');
      expect(result.content[0]?.text).toContain('tere');
    });

    it('should include meanings/definitions', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content[0]?.text).toContain('Meanings');
      expect(result.content[0]?.text).toContain('greeting');
    });

    it('should include usage examples', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content[0]?.text).toContain('Examples');
      expect(result.content[0]?.text).toContain('Tere hommikust');
    });

    it('should return not found message when word does not exist', async () => {
      const mockClient = createMockEkilexClient({
        getWordDetails: vi.fn().mockResolvedValue(undefined),
      });
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 99999 });

      expect(result.content[0]?.text).toContain('No word found');
      expect(result.content[0]?.text).toContain('99999');
      expect(result.content[0]?.text).toContain('search_word');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        getWordDetails: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createGetWordDetailsHandler(mockClient);

      const result = await handler({ wordId: 1 });

      expect(result.content[0]?.text).toContain('Error');
    });
  });
});
