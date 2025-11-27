import { describe, it, expect, vi } from 'vitest';
import { createSearchWordHandler, SearchWordInputSchema } from '../../src/tools/search-word.js';
import { createMockEkilexClient, mockWordSearchResults } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('search_word tool', () => {
  describe('input validation', () => {
    it('should accept valid query string', () => {
      const result = SearchWordInputSchema.safeParse({ query: 'tere' });
      expect(result.success).toBe(true);
    });

    it('should accept query with datasets', () => {
      const result = SearchWordInputSchema.safeParse({
        query: 'tere',
        datasets: 'eki,psv',
      });
      expect(result.success).toBe(true);
    });

    it('should accept query with custom limit', () => {
      const result = SearchWordInputSchema.safeParse({
        query: 'tere',
        limit: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should use default limit of 20', () => {
      const result = SearchWordInputSchema.safeParse({ query: 'tere' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject empty query', () => {
      const result = SearchWordInputSchema.safeParse({ query: '' });
      expect(result.success).toBe(false);
    });

    it('should reject limit over 100', () => {
      const result = SearchWordInputSchema.safeParse({
        query: 'tere',
        limit: 101,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative limit', () => {
      const result = SearchWordInputSchema.safeParse({
        query: 'tere',
        limit: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    it('should return word results for valid query', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'tere', limit: 20 });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(result.content[0]?.text).toContain('tere');
      expect(result.content[0]?.text).toContain('2 word(s)');
    });

    it('should call API client with correct parameters', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchWordHandler(mockClient);

      await handler({ query: 'tere', datasets: 'eki,psv', limit: 20 });

      expect(mockClient.searchWord).toHaveBeenCalledWith('tere', 'eki,psv');
    });

    it('should apply limit to results', async () => {
      const manyResults = Array(30)
        .fill(null)
        .map((_, i) => ({
          ...mockWordSearchResults[0]!,
          wordId: i + 1,
          wordValue: `word${i}`,
        }));

      const mockClient = createMockEkilexClient({
        searchWord: vi.fn().mockResolvedValue(manyResults),
      });
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'word*', limit: 10 });

      // Count how many words are listed in the output
      const wordMatches = result.content[0]?.text.match(/\*\*word\d+\*\*/g);
      expect(wordMatches).toHaveLength(10);
    });

    it('should return helpful message when no results found', async () => {
      const mockClient = createMockEkilexClient({
        searchWord: vi.fn().mockResolvedValue([]),
      });
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'xyznotaword', limit: 20 });

      expect(result.content[0]?.text).toContain('No words found');
      expect(result.content[0]?.text).toContain('xyznotaword');
      expect(result.content[0]?.text).toContain('wildcard');
    });

    it('should include word ID in results', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'tere', limit: 20 });

      expect(result.content[0]?.text).toContain('ID: 1');
      expect(result.content[0]?.text).toContain('ID: 2');
    });

    it('should include language in results', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'tere', limit: 20 });

      expect(result.content[0]?.text).toContain('(est)');
    });

    it('should include usage hint in results', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'tere', limit: 20 });

      expect(result.content[0]?.text).toContain('get_word_details');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        searchWord: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'tere', limit: 20 });

      expect(result.content[0]?.text).toContain('Error');
      expect(result.content[0]?.text).toContain('API error');
    });

    it('should handle unexpected errors gracefully', async () => {
      const mockClient = createMockEkilexClient({
        searchWord: vi.fn().mockRejectedValue(new Error('Unexpected error')),
      });
      const handler = createSearchWordHandler(mockClient);

      const result = await handler({ query: 'tere', limit: 20 });

      expect(result.content[0]?.text).toContain('Error');
    });
  });
});
