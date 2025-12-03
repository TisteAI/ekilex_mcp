import { z } from 'zod';
import type { EkilexApiClient } from '../api/ekilex-client.js';
import { formatErrorForMcp } from '../errors.js';
import type { Domain } from '../types/index.js';

/**
 * Common domain origins for reference
 */
export const DOMAIN_ORIGINS = ['eki', 'lenoch', 'mt'] as const;

/**
 * Input schema for get_domains tool
 */
export const GetDomainsInputSchema = z.object({
  origin: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Domain origin code (e.g., "eki", "lenoch"). Use listOrigins to see available origins.'
    ),
  listOrigins: z
    .boolean()
    .optional()
    .default(false)
    .describe('If true, list all available domain origins instead of fetching domains'),
});

export type GetDomainsInput = z.infer<typeof GetDomainsInputSchema>;

/**
 * Format domains as readable text
 */
function formatDomains(domains: Domain[], origin: string): string {
  if (domains.length === 0) {
    return `No domains found for origin '${origin}'. Use listOrigins: true to see available domain origins.`;
  }

  const lines: string[] = [`Found ${domains.length} domain(s) for origin '${origin}':`, ''];

  for (const domain of domains) {
    lines.push(`- **${domain.code}**: ${domain.value}`);
  }

  lines.push('');
  lines.push('Use these domain codes to filter search results.');

  return lines.join('\n');
}

/**
 * Format domain origins as readable text
 */
function formatOrigins(origins: string[]): string {
  if (origins.length === 0) {
    return 'No domain origins available.';
  }

  const lines: string[] = [`Available domain origins (${origins.length}):`, ''];

  for (const origin of origins) {
    lines.push(`- **${origin}**`);
  }

  lines.push('');
  lines.push('Use get_domains with a specific origin to see its domain codes.');

  return lines.join('\n');
}

/**
 * Create the get_domains tool handler
 */
export function createGetDomainsHandler(client: EkilexApiClient) {
  return async (input: GetDomainsInput): Promise<{ content: { type: 'text'; text: string }[] }> => {
    try {
      // List origins mode
      if (input.listOrigins) {
        const origins = await client.getDomainOrigins();
        return {
          content: [
            {
              type: 'text',
              text: formatOrigins(origins),
            },
          ],
        };
      }

      // Get domains for specific origin
      const origin = input.origin ?? '';
      if (!origin) {
        return {
          content: [
            {
              type: 'text',
              text: 'Please provide an origin or use listOrigins: true to see available domain origins.',
            },
          ],
        };
      }

      const domains = await client.getDomains(origin);
      return {
        content: [
          {
            type: 'text',
            text: formatDomains(domains, origin),
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
export const getDomainsTool = {
  name: 'get_domains',
  description:
    'Get domain classifications for categorizing words by subject area (e.g., medicine, law, technology). Use listOrigins: true to see available domain systems, then fetch domains for a specific origin.',
  inputSchema: GetDomainsInputSchema,
};
