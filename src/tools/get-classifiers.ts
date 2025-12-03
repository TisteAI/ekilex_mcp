import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type { Classifier } from '../types/index.js';

/**
 * Valid classifier types in Ekilex
 */
export const CLASSIFIER_TYPES = [
  'POS',        // Parts of speech
  'MORPH',      // Morphological codes
  'DOMAIN',     // Subject domains
  'REGISTER',   // Language registers (formal, informal, etc.)
  'DERIV',      // Derivation types
  'VALUE_STATE', // Value states
] as const;

/**
 * Input schema for get_classifiers tool
 */
export const GetClassifiersInputSchema = z.object({
  type: z
    .enum(CLASSIFIER_TYPES)
    .describe(
      'Classifier type: POS (parts of speech), MORPH (morphology), DOMAIN (subject areas), REGISTER (formal/informal), DERIV (derivations), VALUE_STATE'
    ),
});

export type GetClassifiersInput = z.infer<typeof GetClassifiersInputSchema>;

/**
 * Get description for classifier type
 */
function getTypeDescription(type: string): string {
  switch (type) {
    case 'POS':
      return 'Parts of Speech - grammatical categories like noun, verb, adjective';
    case 'MORPH':
      return 'Morphological Codes - inflection patterns and grammatical forms';
    case 'DOMAIN':
      return 'Subject Domains - topic areas like medicine, law, technology';
    case 'REGISTER':
      return 'Language Registers - usage contexts like formal, colloquial, slang';
    case 'DERIV':
      return 'Derivation Types - word formation patterns';
    case 'VALUE_STATE':
      return 'Value States - status indicators for lexical entries';
    default:
      return type;
  }
}

/**
 * Format classifiers as readable text
 */
function formatClassifiers(classifiers: Classifier[], type: string): string {
  if (classifiers.length === 0) {
    return `No classifiers found for type '${type}'.`;
  }

  const lines: string[] = [
    `**${getTypeDescription(type)}**`,
    '',
    `Found ${classifiers.length} classifier(s):`,
    '',
  ];

  // Group by language if available
  const byLang = new Map<string, Classifier[]>();
  for (const clf of classifiers) {
    const lang = clf.lang ?? 'unknown';
    const langItems = byLang.get(lang) ?? [];
    langItems.push(clf);
    byLang.set(lang, langItems);
  }

  for (const [lang, items] of byLang) {
    if (byLang.size > 1) {
      lines.push(`### ${lang.toUpperCase()}`);
    }

    for (const clf of items.sort((a, b) => a.code.localeCompare(b.code))) {
      lines.push(`- **${clf.code}**: ${clf.value}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Create the get_classifiers tool handler
 */
export function createGetClassifiersHandler(client: EkilexApiClient) {
  return async (
    input: GetClassifiersInput
  ): Promise<{ content: { type: 'text'; text: string }[] }> => {
    try {
      const classifiers = await client.getClassifiers(input.type);

      return {
        content: [
          {
            type: 'text',
            text: formatClassifiers(classifiers, input.type),
          },
        ],
      };
    } catch (error) {
      return {
        content: [formatErrorForMcp(error)],
      };
    }
  };
}

/**
 * Tool definition for MCP server
 */
export const getClassifiersTool = {
  name: 'get_classifiers',
  description:
    'Get classifier values for understanding word attributes. Types: POS (parts of speech like noun, verb), MORPH (morphological codes), DOMAIN (subject areas like medicine, law), REGISTER (formal/informal usage).',
  inputSchema: GetClassifiersInputSchema,
};
