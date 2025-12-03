import { z } from 'zod';

/**
 * Ekilex API response wrapper schema
 */
export const EkilexResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema.optional(),
  });

/**
 * Word search result from Ekilex API
 * Based on ekilex/data/Word.java - uses passthrough for additional fields
 */
export const WordSearchResultSchema = z
  .object({
    wordId: z.number(),
    wordValue: z.string(),
    wordValuePrese: z.string().optional(),
    homonymNr: z.number().optional(),
    lang: z.string(),
    wordTypeCodes: z.array(z.string()).optional().nullable(),
    prefixoid: z.boolean().optional(),
    suffixoid: z.boolean().optional(),
    foreign: z.boolean().optional(),
    // Additional real API fields
    displayMorphCode: z.string().optional().nullable(),
    genderCode: z.string().optional().nullable(),
    aspectCode: z.string().optional().nullable(),
    vocalForm: z.string().optional().nullable(),
    morphophonoForm: z.string().optional().nullable(),
    isWordPublic: z.boolean().optional(),
    datasetCodes: z.array(z.string()).optional(),
  })
  .passthrough(); // Allow additional unknown fields from real API

export type WordSearchResult = z.infer<typeof WordSearchResultSchema>;

/**
 * Meaning in word details
 */
export const MeaningSchema = z.object({
  meaningId: z.number(),
  lexemeId: z.number().optional(),
  definition: z.string().optional(),
  definitionLang: z.string().optional(),
  domainCodes: z.array(z.string()).optional(),
  registerCodes: z.array(z.string()).optional(),
});

export type Meaning = z.infer<typeof MeaningSchema>;

/**
 * Form (morphological) in word details
 */
export const FormSchema = z.object({
  value: z.string(),
  morphCode: z.string().optional(),
  morphValue: z.string().optional(),
  displayForm: z.string().optional(),
});

export type Form = z.infer<typeof FormSchema>;

/**
 * Usage example
 */
export const UsageSchema = z.object({
  usageId: z.number().optional(),
  value: z.string(),
  lang: z.string().optional(),
  usageTranslations: z.array(z.string()).optional(),
});

export type Usage = z.infer<typeof UsageSchema>;

/**
 * Lexeme (word sense) in word details
 * Based on ekilex/data/Lexeme.java - uses passthrough for additional fields
 */
export const LexemeSchema = z
  .object({
    lexemeId: z.number(),
    meaningId: z.number(),
    datasetCode: z.string().optional().nullable(),
    level1: z.number().optional().nullable(),
    level2: z.number().optional().nullable(),
    wordId: z.number(),
    meaning: MeaningSchema.optional(),
    usages: z.array(UsageSchema).optional(),
    pos: z.array(z.string()).optional(),
    // Additional real API fields
    datasetName: z.string().optional().nullable(),
    levels: z.string().optional().nullable(),
    reliability: z.number().optional().nullable(),
    weight: z.number().optional().nullable(),
    isWord: z.boolean().optional(),
    isCollocation: z.boolean().optional(),
  })
  .passthrough(); // Allow additional unknown fields from real API

export type Lexeme = z.infer<typeof LexemeSchema>;

/**
 * Complete word details from Ekilex API
 */
export const WordDetailsSchema = z.object({
  wordId: z.number(),
  wordValue: z.string(),
  wordValuePrese: z.string().optional(),
  lang: z.string(),
  homonymNr: z.number().optional(),
  wordTypeCodes: z.array(z.string()).optional(),
  forms: z.array(FormSchema).optional(),
  lexemes: z.array(LexemeSchema).optional(),
});

export type WordDetails = z.infer<typeof WordDetailsSchema>;

/**
 * Dataset information
 * Based on ekilex/data/Dataset.java - uses passthrough for additional fields
 */
export const DatasetSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    contact: z.string().optional().nullable(),
    isPublic: z.boolean().optional(),
    // Additional real API fields
    type: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isVisible: z.boolean().optional(),
    isSuperior: z.boolean().optional(),
    origins: z.array(z.string()).optional(),
  })
  .passthrough(); // Allow additional unknown fields from real API

export type Dataset = z.infer<typeof DatasetSchema>;

/**
 * Classifier (POS, MORPH, DOMAIN, etc.)
 * Based on ekilex/data/Classifier.java - uses passthrough for additional fields
 */
export const ClassifierSchema = z
  .object({
    code: z.string(),
    value: z.string(),
    // Real Ekilex API fields
    name: z.string().optional(),
    origin: z.string().optional(),
    parentOrigin: z.string().optional(),
    parentCode: z.string().optional(),
    comment: z.string().optional(),
    datasets: z.array(z.string()).optional(),
    // For compatibility with our display logic
    lang: z.string().optional(),
    type: z.string().optional(),
  })
  .passthrough(); // Allow additional unknown fields from real API

export type Classifier = z.infer<typeof ClassifierSchema>;

/**
 * Domain classification
 */
export const DomainSchema = z.object({
  code: z.string(),
  value: z.string(),
  origin: z.string(),
});

export type Domain = z.infer<typeof DomainSchema>;

/**
 * Meaning search result
 */
export const MeaningSearchResultSchema = z.object({
  meaningId: z.number(),
  wordValues: z.array(z.string()).optional(),
  definition: z.string().optional(),
  domainCodes: z.array(z.string()).optional(),
});

export type MeaningSearchResult = z.infer<typeof MeaningSearchResultSchema>;

/**
 * Word in meaning details
 */
export const MeaningWordSchema = z.object({
  wordId: z.number(),
  wordValue: z.string(),
  lang: z.string(),
  homonymNr: z.number().optional(),
});

export type MeaningWord = z.infer<typeof MeaningWordSchema>;

/**
 * Definition in meaning details
 */
export const MeaningDefinitionSchema = z.object({
  value: z.string(),
  lang: z.string().optional(),
});

export type MeaningDefinition = z.infer<typeof MeaningDefinitionSchema>;

/**
 * Complete meaning details from Ekilex API
 */
export const MeaningDetailsSchema = z.object({
  meaningId: z.number(),
  definitions: z.array(MeaningDefinitionSchema).optional(),
  words: z.array(MeaningWordSchema).optional(),
  domainCodes: z.array(z.string()).optional(),
  registerCodes: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
});

export type MeaningDetails = z.infer<typeof MeaningDetailsSchema>;
