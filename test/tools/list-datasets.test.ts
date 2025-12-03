import { describe, it, expect, vi } from 'vitest';
import {
  createListDatasetsHandler,
  ListDatasetsInputSchema,
} from '../../src/tools/list-datasets.js';
import { createMockEkilexClient, mockDatasets } from '../helpers/mock-ekilex-client.js';
import { EkilexApiError } from '../../src/errors.js';

describe('list_datasets tool', () => {
  describe('input validation', () => {
    it('should accept empty object', () => {
      const result = ListDatasetsInputSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('handler execution', () => {
    it('should return datasets list', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(result.content[0]?.text).toContain('dataset');
    });

    it('should call API client getDatasets', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      await handler({});

      expect(mockClient.getDatasets).toHaveBeenCalled();
    });

    it('should include dataset codes', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('eki');
      expect(result.content[0]?.text).toContain('psv');
    });

    it('should include dataset names', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('EKI ühendsõnastik');
    });

    it('should include dataset descriptions', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('Estonian Combined Dictionary');
    });

    it('should include public status', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('Public');
      expect(result.content[0]?.text).toContain('Yes');
    });

    it('should include usage hint', async () => {
      const mockClient = createMockEkilexClient();
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('search_word');
    });

    it('should return message when no datasets found', async () => {
      const mockClient = createMockEkilexClient({
        getDatasets: vi.fn().mockResolvedValue([]),
      });
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('No datasets');
    });
  });

  describe('error handling', () => {
    it('should return error message when API fails', async () => {
      const mockClient = createMockEkilexClient({
        getDatasets: vi.fn().mockRejectedValue(new EkilexApiError('API error', 500)),
      });
      const handler = createListDatasetsHandler(mockClient);

      const result = await handler({});

      expect(result.content[0]?.text).toContain('Error');
    });
  });
});
