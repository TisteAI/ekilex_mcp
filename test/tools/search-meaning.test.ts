import { describe, it, expect, vi } from 'vitest';
import {
  createSearchMeaningHandler,
  SearchMeaningInputSchema,
} from '../../src/tools/search-meaning.js';
import { createMockEkilexClient, mockMeaningSearchResults } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('search_meaning tool', () => {
  describe('input validation', () => {
    it('should accept valid query', () => {
      const result = SearchMeaningInputSchema.safeParse({ query: 'greeting' });
      expect(result.success).toBe(true);
    });

    it('should accept query with datasets', () => {
      const result = SearchMeaningInputSchema.safeParse({
        query: 'greeting',
        datasets: 'eki,psv',
      });
      expect(result.success).toBe(true);
    });

    it('should accept query with limit', () => {
      const result = SearchMeaningInputSchema.safeParse({
        query: 'greeting',
        limit: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty query', () => {
      const result = SearchMeaningInputSchema.safeParse({ query: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing query', () => {
      const result = SearchMeaningInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject limit over max', () => {
      const result = SearchMeaningInputSchema.safeParse({ query: 'test', limit: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject negative limit', () => {
      const result = SearchMeaningInputSchema.safeParse({ query: 'test', limit: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    it('should return meaning search results', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'greeting' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(result.content[0]?.text).toContain('meaning');
    });

    it('should call API client with correct parameters', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchMeaningHandler(mockClient);

      await handler({ query: 'greeting', datasets: 'eki' });

      expect(mockClient.searchMeaning).toHaveBeenCalledWith('greeting', 'eki');
    });

    it('should include meaning IDs', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'greeting' });

      expect(result.content[0]?.text).toContain('Meaning ID');
    });

    it('should include definitions', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'greeting' });

      expect(result.content[0]?.text).toContain('A greeting');
    });

    it('should include associated words', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'greeting' });

      expect(result.content[0]?.text).toContain('tere');
      expect(result.content[0]?.text).toContain('tervitus');
    });

    it('should apply limit to results', async () => {
      const manyResults = Array.from({ length: 20 }, (_, i) => ({
        meaningId: i + 1,
        definition: `Definition ${i + 1}`,
        wordValues: [`word${i + 1}`],
      }));
      const mockClient = createMockEkilexClient({
        searchMeaning: vi.fn().mockResolvedValue(manyResults),
      });
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'test', limit: 5 });

      // Should have limited results
      const text = result.content[0]?.text ?? '';
      const meaningIdMatches = text.match(/Meaning ID:/g);
      expect(meaningIdMatches?.length).toBeLessThanOrEqual(5);
    });

    it('should return no results message when empty', async () => {
      const mockClient = createMockEkilexClient({
        searchMeaning: vi.fn().mockResolvedValue([]),
      });
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'nonexistent' });

      expect(result.content[0]?.text).toContain('No meanings found');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        searchMeaning: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createSearchMeaningHandler(mockClient);

      const result = await handler({ query: 'test' });

      expect(result.content[0]?.text).toContain('Error');
    });
  });
});
