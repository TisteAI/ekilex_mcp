import { vi } from 'vitest';
import type { EkilexApiClient } from '../../src/api/ekilex-client.js';
import type {
  WordSearchResult,
  WordDetails,
  Dataset,
  Classifier,
  Domain,
  MeaningSearchResult,
  MeaningDetails,
} from '../../src/types/index.js';

/**
 * Mock data for testing
 */
export const mockWordSearchResults: WordSearchResult[] = [
  {
    wordId: 1,
    wordValue: 'tere',
    lang: 'est',
    wordTypeCodes: ['basic'],
  },
  {
    wordId: 2,
    wordValue: 'tervis',
    lang: 'est',
    wordTypeCodes: ['basic'],
  },
];

export const mockWordDetails: WordDetails = {
  wordId: 1,
  wordValue: 'tere',
  lang: 'est',
  homonymNr: 1,
  wordTypeCodes: ['basic'],
  forms: [
    { value: 'tere', morphCode: 'SgN', morphValue: 'singular nominative' },
  ],
  lexemes: [
    {
      lexemeId: 1,
      meaningId: 1,
      wordId: 1,
      datasetCode: 'eki',
      meaning: {
        meaningId: 1,
        lexemeId: 1,
        definition: 'A greeting used when meeting someone',
        definitionLang: 'eng',
      },
      usages: [
        { usageId: 1, value: 'Tere hommikust!', lang: 'est' },
      ],
      pos: ['I'], // Interjection
    },
  ],
};

export const mockDatasets: Dataset[] = [
  {
    code: 'eki',
    name: 'EKI ühendsõnastik',
    description: 'Estonian Combined Dictionary',
    isPublic: true,
  },
  {
    code: 'psv',
    name: 'Põhisõnavara sõnastik',
    description: 'Basic Estonian Dictionary',
    isPublic: true,
  },
];

export const mockClassifiers: Classifier[] = [
  { code: 'S', value: 'noun', lang: 'eng', type: 'POS' },
  { code: 'V', value: 'verb', lang: 'eng', type: 'POS' },
  { code: 'A', value: 'adjective', lang: 'eng', type: 'POS' },
];

export const mockDomains: Domain[] = [
  { code: 'med', value: 'medicine', origin: 'eki' },
  { code: 'law', value: 'law', origin: 'eki' },
];

export const mockMeaningSearchResults: MeaningSearchResult[] = [
  {
    meaningId: 1,
    wordValues: ['tere', 'tervitus'],
    definition: 'A greeting',
    domainCodes: [],
  },
];

export const mockMeaningDetails: MeaningDetails = {
  meaningId: 1,
  definitions: [
    { value: 'A greeting used when meeting someone', lang: 'eng' },
    { value: 'Tervitus kohtudes', lang: 'est' },
  ],
  words: [
    { wordId: 1, wordValue: 'tere', lang: 'est', homonymNr: 1 },
    { wordId: 2, wordValue: 'tervitus', lang: 'est' },
  ],
  domainCodes: ['everyday'],
  registerCodes: ['informal'],
  notes: ['Common greeting in Estonian'],
};

/**
 * Create a mock Ekilex API client for testing
 */
export function createMockEkilexClient(
  overrides: Partial<Record<keyof EkilexApiClient, ReturnType<typeof vi.fn>>> = {}
): EkilexApiClient {
  return {
    searchWord: vi.fn().mockResolvedValue(mockWordSearchResults),
    getWordDetails: vi.fn().mockResolvedValue(mockWordDetails),
    searchMeaning: vi.fn().mockResolvedValue(mockMeaningSearchResults),
    getMeaningDetails: vi.fn().mockResolvedValue(mockMeaningDetails),
    getDatasets: vi.fn().mockResolvedValue(mockDatasets),
    getClassifiers: vi.fn().mockResolvedValue(mockClassifiers),
    getDomains: vi.fn().mockResolvedValue(mockDomains),
    getDomainOrigins: vi.fn().mockResolvedValue(['eki', 'lenoch']),
    ...overrides,
  } as unknown as EkilexApiClient;
}

/**
 * Create a mock fetch function for API client testing
 */
export function createMockFetch(responses: Map<string, unknown>) {
  return vi.fn().mockImplementation(async (url: string) => {
    const path = new URL(url).pathname;

    for (const [pattern, data] of responses) {
      if (path.includes(pattern)) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data }),
        };
      }
    }

    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ success: false, message: 'Not found' }),
    };
  });
}
