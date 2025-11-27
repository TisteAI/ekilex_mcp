import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type { WordDetails, Lexeme, Form } from '../types/index.js';

/**
 * Input schema for get_word_details tool
 */
export const GetWordDetailsInputSchema = z.object({
  wordId: z.number().int().positive().describe('Word ID from search_word results'),
  datasets: z
    .string()
    .optional()
    .describe('Comma-separated dataset codes to filter results'),
});

export type GetWordDetailsInput = z.infer<typeof GetWordDetailsInputSchema>;

/**
 * Format morphological forms as readable text
 */
function formatForms(forms: Form[]): string {
  if (forms.length === 0) return '';

  const lines = ['', '**Morphological Forms:**'];
  for (const form of forms.slice(0, 10)) {
    // Limit to first 10 forms
    const parts = [form.value];
    if (form.morphValue) {
      parts.push(`(${form.morphValue})`);
    } else if (form.morphCode) {
      parts.push(`[${form.morphCode}]`);
    }
    lines.push(`  - ${parts.join(' ')}`);
  }
  if (forms.length > 10) {
    lines.push(`  ... and ${forms.length - 10} more forms`);
  }
  return lines.join('\n');
}

/**
 * Format lexemes (word senses) as readable text
 */
function formatLexemes(lexemes: Lexeme[]): string {
  if (lexemes.length === 0) return '';

  const lines = ['', '**Meanings:**'];

  for (let i = 0; i < lexemes.length; i++) {
    const lexeme = lexemes[i];
    if (!lexeme) continue;
    const meaningNum = i + 1;

    // Definition
    if (lexeme.meaning?.definition) {
      lines.push(`${meaningNum}. ${lexeme.meaning.definition}`);
    } else {
      lines.push(`${meaningNum}. (no definition available)`);
    }

    // Part of speech
    if (lexeme.pos && lexeme.pos.length > 0) {
      lines.push(`   POS: ${lexeme.pos.join(', ')}`);
    }

    // Domain/register
    if (lexeme.meaning?.domainCodes && lexeme.meaning.domainCodes.length > 0) {
      lines.push(`   Domain: ${lexeme.meaning.domainCodes.join(', ')}`);
    }
    if (lexeme.meaning?.registerCodes && lexeme.meaning.registerCodes.length > 0) {
      lines.push(`   Register: ${lexeme.meaning.registerCodes.join(', ')}`);
    }

    // Usage examples
    if (lexeme.usages && lexeme.usages.length > 0) {
      lines.push('   Examples:');
      for (const usage of lexeme.usages.slice(0, 3)) {
        // Limit to 3 examples
        lines.push(`     - "${usage.value}"`);
        const firstTranslation = usage.usageTranslations?.[0];
        if (firstTranslation) {
          lines.push(`       → ${firstTranslation}`);
        }
      }
      if (lexeme.usages.length > 3) {
        lines.push(`     ... and ${lexeme.usages.length - 3} more examples`);
      }
    }

    // Dataset info
    if (lexeme.datasetCode) {
      lines.push(`   Source: ${lexeme.datasetCode}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format word details as readable text
 */
function formatWordDetails(details: WordDetails): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${details.wordValue}`);
  lines.push('');

  // Basic info
  const infoLine = [`Language: ${details.lang}`];
  if (details.homonymNr && details.homonymNr > 1) {
    infoLine.push(`Homonym: ${details.homonymNr}`);
  }
  if (details.wordTypeCodes && details.wordTypeCodes.length > 0) {
    infoLine.push(`Type: ${details.wordTypeCodes.join(', ')}`);
  }
  lines.push(infoLine.join(' | '));

  // Forms
  if (details.forms && details.forms.length > 0) {
    lines.push(formatForms(details.forms));
  }

  // Lexemes (meanings)
  if (details.lexemes && details.lexemes.length > 0) {
    lines.push(formatLexemes(details.lexemes));
  }

  return lines.join('\n');
}

/**
 * Create the get_word_details tool handler
 */
export function createGetWordDetailsHandler(client: EkilexApiClient) {
  return async (
    input: GetWordDetailsInput
  ): Promise<{ content: { type: 'text'; text: string }[] }> => {
    try {
      const details = await client.getWordDetails(input.wordId, input.datasets);

      if (!details) {
        return {
          content: [
            {
              type: 'text',
              text: `No word found with ID ${input.wordId}. Use search_word to find valid word IDs.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: formatWordDetails(details),
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
export const getWordDetailsTool = {
  name: 'get_word_details',
  description:
    'Get complete details for an Estonian word including definitions, morphological forms, usage examples, and translations. Use after search_word to get full information about a specific word.',
  inputSchema: GetWordDetailsInputSchema,
};
