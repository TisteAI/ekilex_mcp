import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type { Dataset, McpToolResponse } from '../types/index.js';

/**
 * Input schema for list_datasets tool (no parameters required)
 */
export const ListDatasetsInputSchema = z.object({});

export type ListDatasetsInput = z.infer<typeof ListDatasetsInputSchema>;

/**
 * Format datasets as readable text
 */
function formatDatasets(datasets: Dataset[]): string {
  if (datasets.length === 0) {
    return 'No datasets available.';
  }

  const lines: string[] = [`Found ${datasets.length} dataset(s):`, ''];

  // Sort by name
  const sorted = [...datasets].sort((a, b) => a.name.localeCompare(b.name));

  for (const dataset of sorted) {
    lines.push(`**${dataset.code}** - ${dataset.name}`);
    if (dataset.description) {
      lines.push(`  ${dataset.description}`);
    }
    if (dataset.isPublic !== undefined) {
      lines.push(`  Public: ${dataset.isPublic ? 'Yes' : 'No'}`);
    }
    lines.push('');
  }

  lines.push('Use dataset codes with search_word to filter searches (e.g., datasets: "eki,psv").');

  return lines.join('\n');
}

/**
 * Create the list_datasets tool handler
 */
export function createListDatasetsHandler(client: EkilexApiClient) {
  return async (_input: ListDatasetsInput): Promise<McpToolResponse> => {
    try {
      const datasets = await client.getDatasets();

      return {
        content: [
          {
            type: 'text',
            text: formatDatasets(datasets),
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
export const listDatasetsTool = {
  name: 'list_datasets',
  description:
    'List all available dictionary datasets in Ekilex. Use this to discover which dictionaries are available to search in. Use the dataset codes with search_word or get_word_details to filter results.',
  inputSchema: ListDatasetsInputSchema,
};
