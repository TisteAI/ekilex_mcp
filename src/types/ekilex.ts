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
 */
export const WordSearchResultSchema = z.object({
  wordId: z.number(),
  wordValue: z.string(),
  wordValuePrese: z.string().optional(),
  homonymNr: z.number().optional(),
  lang: z.string(),
  wordTypeCodes: z.array(z.string()).optional(),
  prefixoid: z.boolean().optional(),
  suffixoid: z.boolean().optional(),
  foreign: z.boolean().optional(),
});

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
 */
export const LexemeSchema = z.object({
  lexemeId: z.number(),
  meaningId: z.number(),
  datasetCode: z.string().optional(),
  level1: z.number().optional(),
  level2: z.number().optional(),
  wordId: z.number(),
  meaning: MeaningSchema.optional(),
  usages: z.array(UsageSchema).optional(),
  pos: z.array(z.string()).optional(),
});

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
 */
export const DatasetSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  contact: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type Dataset = z.infer<typeof DatasetSchema>;

/**
 * Classifier (POS, MORPH, DOMAIN, etc.)
 */
export const ClassifierSchema = z.object({
  code: z.string(),
  value: z.string(),
  lang: z.string().optional(),
  type: z.string().optional(),
});

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
