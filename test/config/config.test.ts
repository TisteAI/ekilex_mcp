import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig, validateConfig, ConfigurationError } from '../../src/config/index.js';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config from environment variables', () => {
      process.env['EKILEX_API_KEY'] = 'test-api-key-12345';
      process.env['EKILEX_BASE_URL'] = 'https://custom.ekilex.ee';
      process.env['EKILEX_TIMEOUT'] = '60000';
      process.env['LOG_LEVEL'] = 'debug';

      const config = loadConfig();

      expect(config.apiKey).toBe('test-api-key-12345');
      expect(config.baseUrl).toBe('https://custom.ekilex.ee');
      expect(config.timeout).toBe(60000);
      expect(config.logLevel).toBe('debug');
    });

    it('should use default values when optional env vars are not set', () => {
      process.env['EKILEX_API_KEY'] = 'test-api-key-12345';
      delete process.env['EKILEX_BASE_URL'];
      delete process.env['EKILEX_TIMEOUT'];
      delete process.env['LOG_LEVEL'];

      const config = loadConfig();

      expect(config.baseUrl).toBe('https://ekilex.eki.ee');
      expect(config.timeout).toBe(30000);
      expect(config.logLevel).toBe('info');
    });

    it('should throw ConfigurationError when API key is missing', () => {
      delete process.env['EKILEX_API_KEY'];

      expect(() => loadConfig()).toThrow(ConfigurationError);
      expect(() => loadConfig()).toThrow('apiKey');
    });

    it('should throw ConfigurationError when API key is empty', () => {
      process.env['EKILEX_API_KEY'] = '';

      expect(() => loadConfig()).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when base URL is invalid', () => {
      process.env['EKILEX_API_KEY'] = 'test-key';
      process.env['EKILEX_BASE_URL'] = 'not-a-valid-url';

      expect(() => loadConfig()).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when timeout is invalid', () => {
      process.env['EKILEX_API_KEY'] = 'test-key';
      process.env['EKILEX_TIMEOUT'] = '-1';

      expect(() => loadConfig()).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when log level is invalid', () => {
      process.env['EKILEX_API_KEY'] = 'test-key';
      process.env['LOG_LEVEL'] = 'invalid';

      expect(() => loadConfig()).toThrow(ConfigurationError);
    });
  });

  describe('validateConfig', () => {
    it('should not throw for valid config', () => {
      const config = {
        apiKey: 'test-api-key',
        baseUrl: 'https://ekilex.eki.ee',
        timeout: 30000,
        logLevel: 'info' as const,
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw ConfigurationError for empty API key', () => {
      const config = {
        apiKey: '',
        baseUrl: 'https://ekilex.eki.ee',
        timeout: 30000,
        logLevel: 'info' as const,
      };

      expect(() => validateConfig(config)).toThrow(ConfigurationError);
    });
  });
});
