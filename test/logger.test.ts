import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, NoopLogger } from '../src/logger.js';

describe('Logger', () => {
  let originalConsole: {
    debug: typeof console.debug;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
  };

  beforeEach(() => {
    // Save original console methods
    originalConsole = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('createLogger', () => {
    it('should create a logger with default info level', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
    });

    it('should create a logger with specified level', () => {
      const logger = createLogger('debug');
      expect(logger).toBeDefined();
    });
  });

  describe('log level filtering', () => {
    it('should log at debug level when set to debug', () => {
      const debugMock = vi.fn();
      console.debug = debugMock;

      const logger = createLogger('debug');
      logger.debug('test message');

      expect(debugMock).toHaveBeenCalled();
    });

    it('should not log debug when set to info', () => {
      const debugMock = vi.fn();
      console.debug = debugMock;

      const logger = createLogger('info');
      logger.debug('test message');

      expect(debugMock).not.toHaveBeenCalled();
    });

    it('should log info when set to info', () => {
      const infoMock = vi.fn();
      console.info = infoMock;

      const logger = createLogger('info');
      logger.info('test message');

      expect(infoMock).toHaveBeenCalled();
    });

    it('should log error when set to error', () => {
      const errorMock = vi.fn();
      console.error = errorMock;

      const logger = createLogger('error');
      logger.error('test message');

      expect(errorMock).toHaveBeenCalled();
    });

    it('should only log warn and error when set to warn', () => {
      const infoMock = vi.fn();
      const warnMock = vi.fn();
      console.info = infoMock;
      console.warn = warnMock;

      const logger = createLogger('warn');
      logger.info('info message');
      logger.warn('warn message');

      expect(infoMock).not.toHaveBeenCalled();
      expect(warnMock).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('should include timestamp and level in message', () => {
      const infoMock = vi.fn();
      console.info = infoMock;

      const logger = createLogger('info');
      logger.info('test message');

      expect(infoMock).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[INFO\] test message/
        )
      );
    });

    it('should pass additional arguments', () => {
      const infoMock = vi.fn();
      console.info = infoMock;

      const logger = createLogger('info');
      logger.info('test message', { extra: 'data' });

      expect(infoMock).toHaveBeenCalledWith(expect.any(String), { extra: 'data' });
    });
  });
});

describe('NoopLogger', () => {
  it('should not throw when calling any method', () => {
    const logger = new NoopLogger();

    expect(() => logger.debug('test')).not.toThrow();
    expect(() => logger.info('test')).not.toThrow();
    expect(() => logger.warn('test')).not.toThrow();
    expect(() => logger.error('test')).not.toThrow();
  });

  it('should not call console methods', () => {
    const debugMock = vi.fn();
    const infoMock = vi.fn();
    const warnMock = vi.fn();
    const errorMock = vi.fn();

    console.debug = debugMock;
    console.info = infoMock;
    console.warn = warnMock;
    console.error = errorMock;

    const logger = new NoopLogger();
    logger.debug('test');
    logger.info('test');
    logger.warn('test');
    logger.error('test');

    expect(debugMock).not.toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();
    expect(warnMock).not.toHaveBeenCalled();
    expect(errorMock).not.toHaveBeenCalled();
  });
});
