import { beforeAll, afterAll, vi } from 'vitest';

// Set up test environment
beforeAll(() => {
  // Suppress console output during tests unless debugging
  if (!process.env['DEBUG_TESTS']) {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  }
});

afterAll(() => {
  vi.restoreAllMocks();
});
