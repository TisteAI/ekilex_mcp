import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type { WordSearchResult, McpToolResponse } from '../types/index.js';

/**
 * Input schema for search_word tool
 */
export const SearchWordInputSchema = z.object({
  query: z.string().min(1).describe('Word to search for (supports * and ? wildcards)'),
  datasets: z
    .string()
    .optional()
    .describe('Comma-separated dataset codes to search in (e.g., "eki,psv")'),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20)
    .describe('Maximum results to return (default: 20)'),
});

export type SearchWordInput = z.infer<typeof SearchWordInputSchema>;

/**
 * Format word search results as readable text
 */
function formatWordResults(words: WordSearchResult[], query: string): string {
  if (words.length === 0) {
    return `No words found matching '${query}'. Try using wildcards (* for any characters, ? for single character) or checking the spelling.`;
  }

  const lines: string[] = [`Found ${words.length} word(s) matching '${query}':`, ''];

  for (const word of words) {
    const parts = [`**${word.wordValue}**`];
    parts.push(`[ID: ${word.wordId}]`);
    parts.push(`(${word.lang})`);

    if (word.homonymNr && word.homonymNr > 1) {
      parts.push(`[homonym ${word.homonymNr}]`);
    }

    if (word.wordTypeCodes && word.wordTypeCodes.length > 0) {
      parts.push(`{${word.wordTypeCodes.join(', ')}}`);
    }

    lines.push(`- ${parts.join(' ')}`);
  }

  lines.push('');
  lines.push('Use get_word_details with the word ID to get full information.');

  return lines.join('\n');
}

/**
 * Create the search_word tool handler
 */
export function createSearchWordHandler(client: EkilexApiClient) {
  return async (input: SearchWordInput): Promise<McpToolResponse> => {
    try {
      const results = await client.searchWord(input.query, input.datasets);

      // Apply limit
      const limitedResults = results.slice(0, input.limit);

      return {
        content: [
          {
            type: 'text',
            text: formatWordResults(limitedResults, input.query),
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
export const searchWordTool = {
  name: 'search_word',
  description:
    'Search for Estonian words in the Ekilex dictionary. Supports wildcards: * (any characters) and ? (single character). Returns matching words with basic info. Use get_word_details with the word ID to get complete information.',
  inputSchema: SearchWordInputSchema,
};
