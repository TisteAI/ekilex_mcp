import { describe, it, expect, vi } from 'vitest';
import {
  createGetClassifiersHandler,
  GetClassifiersInputSchema,
  CLASSIFIER_TYPES,
} from '../../src/tools/get-classifiers.js';
import { createMockEkilexClient, mockClassifiers } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('get_classifiers tool', () => {
  describe('input validation', () => {
    it('should accept valid POS type', () => {
      const result = GetClassifiersInputSchema.safeParse({ type: 'POS' });
      expect(result.success).toBe(true);
    });

    it('should accept valid MORPH type', () => {
      const result = GetClassifiersInputSchema.safeParse({ type: 'MORPH' });
      expect(result.success).toBe(true);
    });

    it('should accept valid DOMAIN type', () => {
      const result = GetClassifiersInputSchema.safeParse({ type: 'DOMAIN' });
      expect(result.success).toBe(true);
    });

    it('should accept valid REGISTER type', () => {
      const result = GetClassifiersInputSchema.safeParse({ type: 'REGISTER' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = GetClassifiersInputSchema.safeParse({ type: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const result = GetClassifiersInputSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty type', () => {
      const result = GetClassifiersInputSchema.safeParse({ type: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    it('should return classifiers for valid type', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should call API client with correct type', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetClassifiersHandler(mockClient);

      await handler({ type: 'POS' });

      expect(mockClient.getClassifiers).toHaveBeenCalledWith('POS');
    });

    it('should include classifier codes', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content[0]?.text).toContain('S');
      expect(result.content[0]?.text).toContain('V');
      expect(result.content[0]?.text).toContain('A');
    });

    it('should include classifier values', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content[0]?.text).toContain('noun');
      expect(result.content[0]?.text).toContain('verb');
      expect(result.content[0]?.text).toContain('adjective');
    });

    it('should include type description for POS', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content[0]?.text).toContain('Parts of Speech');
    });

    it('should return empty message when no classifiers found', async () => {
      const mockClient = createMockEkilexClient({
        getClassifiers: vi.fn().mockResolvedValue([]),
      });
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content[0]?.text).toContain('No classifiers found');
    });

    it('should group classifiers by language when multiple languages present', async () => {
      const multiLangClassifiers = [
        { code: 'S', value: 'noun', lang: 'eng', type: 'POS' },
        { code: 'S', value: 'nimisõna', lang: 'est', type: 'POS' },
      ];
      const mockClient = createMockEkilexClient({
        getClassifiers: vi.fn().mockResolvedValue(multiLangClassifiers),
      });
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content[0]?.text).toContain('ENG');
      expect(result.content[0]?.text).toContain('EST');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        getClassifiers: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createGetClassifiersHandler(mockClient);

      const result = await handler({ type: 'POS' });

      expect(result.content[0]?.text).toContain('Error');
    });
  });

  describe('constants', () => {
    it('should export valid classifier types', () => {
      expect(CLASSIFIER_TYPES).toBeDefined();
      expect(CLASSIFIER_TYPES).toContain('POS');
      expect(CLASSIFIER_TYPES).toContain('MORPH');
      expect(CLASSIFIER_TYPES).toContain('DOMAIN');
      expect(CLASSIFIER_TYPES).toContain('REGISTER');
    });
  });
});
