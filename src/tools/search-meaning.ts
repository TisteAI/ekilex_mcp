import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type { MeaningSearchResult, McpToolResponse } from '../types/index.js';

/**
 * Input schema for search_meaning tool
 */
export const SearchMeaningInputSchema = z.object({
  query: z.string().min(1).describe('Meaning/concept to search for'),
  datasets: z
    .string()
    .optional()
    .describe('Comma-separated dataset codes to search in (e.g., "eki,psv")'),
  limit: z
    .number()
    .int()
    .positive()
    .max(50)
    .optional()
    .default(10)
    .describe('Maximum results to return (default: 10)'),
});

export type SearchMeaningInput = z.infer<typeof SearchMeaningInputSchema>;

/**
 * Format meaning search results as readable text
 */
function formatMeaningResults(meanings: MeaningSearchResult[], query: string): string {
  if (meanings.length === 0) {
    return `No meanings found matching '${query}'. Try different search terms or use search_word to search by word form instead.`;
  }

  const lines: string[] = [`Found ${meanings.length} meaning(s) matching '${query}':`, ''];

  for (const meaning of meanings) {
    lines.push(`**Meaning ID: ${meaning.meaningId}**`);

    if (meaning.definition) {
      lines.push(`  Definition: ${meaning.definition}`);
    }

    if (meaning.wordValues && meaning.wordValues.length > 0) {
      lines.push(`  Words: ${meaning.wordValues.join(', ')}`);
    }

    if (meaning.domainCodes && meaning.domainCodes.length > 0) {
      lines.push(`  Domains: ${meaning.domainCodes.join(', ')}`);
    }

    lines.push('');
  }

  lines.push(
    'Use search_word with specific words to get full details including morphology and examples.'
  );

  return lines.join('\n');
}

/**
 * Create the search_meaning tool handler
 */
export function createSearchMeaningHandler(client: EkilexApiClient) {
  return async (input: SearchMeaningInput): Promise<McpToolResponse> => {
    try {
      const results = await client.searchMeaning(input.query, input.datasets);

      // Apply limit
      const limitedResults = results.slice(0, input.limit);

      return {
        content: [
          {
            type: 'text',
            text: formatMeaningResults(limitedResults, input.query),
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
export const searchMeaningTool = {
  name: 'search_meaning',
  description:
    "Search for Estonian words by semantic meaning or concept. Useful when you know what concept you're looking for but not the exact word. Returns meanings with associated words.",
  inputSchema: SearchMeaningInputSchema,
};
