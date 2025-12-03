import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type {
  MeaningDetails,
  MeaningDefinition,
  MeaningWord,
  McpToolResponse,
} from '../types/index.js';

/**
 * Input schema for get_meaning_details tool
 */
export const GetMeaningDetailsInputSchema = z.object({
  meaningId: z.number().int().positive().describe('Meaning ID from search_meaning results'),
  datasets: z.string().optional().describe('Comma-separated dataset codes to filter results'),
});

export type GetMeaningDetailsInput = z.infer<typeof GetMeaningDetailsInputSchema>;

/**
 * Format definitions as readable text
 */
function formatDefinitions(definitions: MeaningDefinition[]): string {
  if (definitions.length === 0) return '';

  const lines = ['', '**Definitions:**'];
  for (const def of definitions) {
    const langPart = def.lang ? ` (${def.lang})` : '';
    lines.push(`  - ${def.value}${langPart}`);
  }
  return lines.join('\n');
}

/**
 * Format related words as readable text
 */
function formatWords(words: MeaningWord[]): string {
  if (words.length === 0) return '';

  const lines = ['', '**Related Words:**'];
  for (const word of words) {
    const parts = [`**${word.wordValue}**`, `[ID: ${word.wordId}]`, `(${word.lang})`];
    if (word.homonymNr && word.homonymNr > 1) {
      parts.push(`[homonym ${word.homonymNr}]`);
    }
    lines.push(`  - ${parts.join(' ')}`);
  }
  return lines.join('\n');
}

/**
 * Format meaning details as readable text
 */
function formatMeaningDetails(details: MeaningDetails): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Meaning Details`);
  lines.push(`ID: ${details.meaningId}`);
  lines.push('');

  // Definitions
  if (details.definitions && details.definitions.length > 0) {
    lines.push(formatDefinitions(details.definitions));
  }

  // Related words
  if (details.words && details.words.length > 0) {
    lines.push(formatWords(details.words));
  }

  // Domain codes
  if (details.domainCodes && details.domainCodes.length > 0) {
    lines.push('');
    lines.push(`**Domains:** ${details.domainCodes.join(', ')}`);
  }

  // Register codes
  if (details.registerCodes && details.registerCodes.length > 0) {
    lines.push('');
    lines.push(`**Registers:** ${details.registerCodes.join(', ')}`);
  }

  // Notes
  if (details.notes && details.notes.length > 0) {
    lines.push('');
    lines.push('**Notes:**');
    for (const note of details.notes) {
      lines.push(`  - ${note}`);
    }
  }

  return lines.join('\n');
}

/**
 * Create the get_meaning_details tool handler
 */
export function createGetMeaningDetailsHandler(client: EkilexApiClient) {
  return async (input: GetMeaningDetailsInput): Promise<McpToolResponse> => {
    try {
      const details = await client.getMeaningDetails(input.meaningId, input.datasets);

      if (!details) {
        return {
          content: [
            {
              type: 'text',
              text: `No meaning found with ID ${input.meaningId}. Use search_meaning to find valid meaning IDs.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: formatMeaningDetails(details),
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
export const getMeaningDetailsTool = {
  name: 'get_meaning_details',
  description:
    'Get complete details for a meaning including definitions, related words, domain codes, and notes. Use after search_meaning to get full information about a specific meaning.',
  inputSchema: GetMeaningDetailsInputSchema,
};
