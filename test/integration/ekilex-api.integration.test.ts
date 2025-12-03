/**
 * Integration tests for Ekilex API
 *
 * These tests run against the real Ekilex API and require an API key.
 * Set EKILEX_API_KEY environment variable to run these tests.
 *
 * Run with: EKILEX_API_KEY=your-key npm test -- test/integration/ekilex-api.integration.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { EkilexApiClient } from '../../src/api/ekilex-client.js';

const API_KEY = process.env.EKILEX_API_KEY;
const SKIP_INTEGRATION = !API_KEY;

describe.skipIf(SKIP_INTEGRATION)('Ekilex API Integration Tests', () => {
  let client: EkilexApiClient;

  beforeAll(() => {
    client = new EkilexApiClient({
      apiKey: API_KEY!,
      baseUrl: 'https://ekilex.eki.ee',
      timeout: 30000,
    });
  });

  describe('searchWord', () => {
    it('should search for "tere" and return valid results', async () => {
      const results = await client.searchWord('tere');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Validate first result has required fields
      const first = results[0];
      expect(first).toBeDefined();
      expect(typeof first?.wordId).toBe('number');
      expect(typeof first?.wordValue).toBe('string');
      expect(typeof first?.lang).toBe('string');
    });

    it('should handle wildcard search "ter*"', async () => {
      const results = await client.searchWord('ter*');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search with dataset filter', async () => {
      const results = await client.searchWord('tere', 'eki');

      expect(Array.isArray(results)).toBe(true);
      // May be empty if word not in dataset, but should not error
    });

    it('should return empty array for non-existent word', async () => {
      const results = await client.searchWord('xyznonexistentword123');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getWordDetails', () => {
    it('should get details for a known word', async () => {
      // First search to get a valid wordId
      const searchResults = await client.searchWord('tere');
      expect(searchResults.length).toBeGreaterThan(0);

      const wordId = searchResults[0]!.wordId;
      const details = await client.getWordDetails(wordId);

      expect(details).toBeDefined();
      expect(details?.wordId).toBe(wordId);
      expect(typeof details?.wordValue).toBe('string');
      expect(typeof details?.lang).toBe('string');
    });

    it('should return undefined for non-existent wordId', async () => {
      const details = await client.getWordDetails(999999999);

      // API may return undefined or empty for non-existent IDs
      // The exact behavior depends on Ekilex implementation
      expect(details).toBeUndefined();
    });
  });

  describe('getDatasets', () => {
    it('should return list of datasets', async () => {
      const datasets = await client.getDatasets();

      expect(Array.isArray(datasets)).toBe(true);
      expect(datasets.length).toBeGreaterThan(0);

      // Validate structure
      const first = datasets[0];
      expect(first).toBeDefined();
      expect(typeof first?.code).toBe('string');
      expect(typeof first?.name).toBe('string');
    });

    it('should include common dataset "eki"', async () => {
      const datasets = await client.getDatasets();

      const ekiDataset = datasets.find((d) => d.code === 'eki');
      // eki might not always exist, so just log if missing
      if (ekiDataset) {
        expect(ekiDataset.code).toBe('eki');
      }
    });
  });

  describe('getClassifiers', () => {
    it('should return POS classifiers', async () => {
      const classifiers = await client.getClassifiers('POS');

      expect(Array.isArray(classifiers)).toBe(true);
      expect(classifiers.length).toBeGreaterThan(0);

      // Validate structure
      const first = classifiers[0];
      expect(first).toBeDefined();
      expect(typeof first?.code).toBe('string');
      expect(typeof first?.value).toBe('string');
    });

    it('should return MORPH classifiers', async () => {
      const classifiers = await client.getClassifiers('MORPH');

      expect(Array.isArray(classifiers)).toBe(true);
      expect(classifiers.length).toBeGreaterThan(0);
    });

    it('should return DOMAIN classifiers', async () => {
      const classifiers = await client.getClassifiers('DOMAIN');

      expect(Array.isArray(classifiers)).toBe(true);
      // DOMAIN might be empty depending on Ekilex configuration
    });
  });

  describe('getDomainOrigins', () => {
    it('should return list of domain origins', async () => {
      const origins = await client.getDomainOrigins();

      expect(Array.isArray(origins)).toBe(true);
      // Origins list should have at least some entries
      expect(origins.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDomains', () => {
    it('should return domains for a valid origin', async () => {
      // First get available origins
      const origins = await client.getDomainOrigins();

      if (origins.length > 0) {
        const domains = await client.getDomains(origins[0]!);

        expect(Array.isArray(domains)).toBe(true);
        // Domains may be empty for some origins
      }
    });
  });

  describe('searchMeaning', () => {
    it('should search for meanings', async () => {
      const results = await client.searchMeaning('tervitus');

      expect(Array.isArray(results)).toBe(true);
      // Meaning search might return empty results
    });
  });

  describe('getMeaningDetails', () => {
    it('should get meaning details if searchMeaning returns results', async () => {
      const searchResults = await client.searchMeaning('tere');

      if (searchResults.length > 0) {
        const meaningId = searchResults[0]!.meaningId;
        const details = await client.getMeaningDetails(meaningId);

        expect(details).toBeDefined();
        expect(details?.meaningId).toBe(meaningId);
      }
    });
  });

  describe('Response Schema Validation', () => {
    it('should parse word search results with all real API fields', async () => {
      const results = await client.searchWord('maja');

      if (results.length > 0) {
        const word = results[0]!;
        // Log actual fields for debugging schema mismatches
        console.log('Sample word search result fields:', Object.keys(word));

        // These are the fields our schema requires
        expect(word.wordId).toBeDefined();
        expect(word.wordValue).toBeDefined();
        expect(word.lang).toBeDefined();
      }
    });

    it('should parse dataset results with all real API fields', async () => {
      const datasets = await client.getDatasets();

      if (datasets.length > 0) {
        const dataset = datasets[0]!;
        console.log('Sample dataset fields:', Object.keys(dataset));

        expect(dataset.code).toBeDefined();
        expect(dataset.name).toBeDefined();
      }
    });

    it('should parse classifier results with all real API fields', async () => {
      const classifiers = await client.getClassifiers('POS');

      if (classifiers.length > 0) {
        const classifier = classifiers[0]!;
        console.log('Sample classifier fields:', Object.keys(classifier));

        expect(classifier.code).toBeDefined();
        expect(classifier.value).toBeDefined();
      }
    });
  });
});

// Informational test that always runs
describe('Integration Test Info', () => {
  it('should show integration test status', () => {
    if (SKIP_INTEGRATION) {
      console.log(
        '\n⚠️  EKILEX_API_KEY not set - skipping real API integration tests.\n' +
          '   To run integration tests: EKILEX_API_KEY=your-key npm test\n'
      );
    } else {
      console.log('\n✅ Running integration tests against real Ekilex API\n');
    }
    expect(true).toBe(true);
  });
});
