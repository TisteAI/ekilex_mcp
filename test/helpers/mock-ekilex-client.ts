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
 * Structured to match real Ekilex API responses from ekilex/data/*.java
 */
export const mockWordSearchResults: WordSearchResult[] = [
  {
    wordId: 1,
    wordValue: 'tere',
    wordValuePrese: 'tere',
    homonymNr: 1,
    lang: 'est',
    wordTypeCodes: null, // Real API often returns null
    displayMorphCode: null,
    genderCode: null,
    aspectCode: null,
    vocalForm: null,
    morphophonoForm: null,
    prefixoid: false,
    suffixoid: false,
    foreign: false,
    isWordPublic: true,
    datasetCodes: ['eki', 'psv'],
  },
  {
    wordId: 2,
    wordValue: 'tervis',
    wordValuePrese: 'tervis',
    homonymNr: 1,
    lang: 'est',
    wordTypeCodes: null,
    displayMorphCode: 'SgN',
    genderCode: null,
    aspectCode: null,
    vocalForm: null,
    morphophonoForm: null,
    prefixoid: false,
    suffixoid: false,
    foreign: false,
    isWordPublic: true,
    datasetCodes: ['eki'],
  },
];

export const mockWordDetails: WordDetails = {
  wordId: 1,
  wordValue: 'tere',
  wordValuePrese: 'tere',
  lang: 'est',
  homonymNr: 1,
  wordTypeCodes: null, // Real API often returns null for this
  forms: [
    {
      value: 'tere',
      morphCode: 'SgN',
      morphValue: 'ainsuse nimetav',
      displayForm: 'tere',
    },
  ],
  lexemes: [
    {
      lexemeId: 101,
      meaningId: 1,
      wordId: 1,
      datasetCode: 'eki',
      datasetName: 'EKI ühendsõnastik',
      level1: 1,
      level2: 0,
      levels: '1',
      reliability: null,
      weight: 1.0,
      isWord: true,
      isCollocation: false,
      meaning: {
        meaningId: 1,
        lexemeId: 101,
        definition: 'A greeting used when meeting someone',
        definitionLang: 'eng',
        domainCodes: [],
        registerCodes: ['informal'],
      },
      usages: [
        {
          usageId: 1001,
          value: 'Tere hommikust!',
          lang: 'est',
          usageTranslations: ['Good morning!'],
        },
        {
          usageId: 1002,
          value: 'Tere, kuidas läheb?',
          lang: 'est',
          usageTranslations: ['Hello, how are you?'],
        },
      ],
      pos: ['I'], // Interjection
    },
  ],
};

export const mockDatasets: Dataset[] = [
  {
    code: 'eki',
    name: 'EKI ühendsõnastik',
    type: 'LEX', // Real API has type field
    description: 'Estonian Combined Dictionary',
    contact: 'eki@eki.ee',
    imageUrl: null,
    isPublic: true,
    isVisible: true,
    isSuperior: false,
    origins: ['eki'],
  },
  {
    code: 'psv',
    name: 'Põhisõnavara sõnastik',
    type: 'LEX',
    description: 'Basic Estonian Dictionary',
    contact: null,
    imageUrl: null,
    isPublic: true,
    isVisible: true,
    isSuperior: false,
    origins: ['eki'],
  },
];

export const mockClassifiers: Classifier[] = [
  {
    code: 'S',
    name: 'POS',
    origin: 'eki',
    parentOrigin: null,
    parentCode: null,
    value: 'noun',
    comment: 'Substantive / Noun',
    datasets: null,
    lang: 'eng',
    type: 'POS',
  },
  {
    code: 'V',
    name: 'POS',
    origin: 'eki',
    parentOrigin: null,
    parentCode: null,
    value: 'verb',
    comment: 'Verb',
    datasets: null,
    lang: 'eng',
    type: 'POS',
  },
  {
    code: 'A',
    name: 'POS',
    origin: 'eki',
    parentOrigin: null,
    parentCode: null,
    value: 'adjective',
    comment: 'Adjective',
    datasets: null,
    lang: 'eng',
    type: 'POS',
  },
] as Classifier[];

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
