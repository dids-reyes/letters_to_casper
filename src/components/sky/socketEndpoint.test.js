import { resolveSkySocketEndpoint } from './socketEndpoint';

describe('resolveSkySocketEndpoint', () => {
  test('replaces localhost with the browser LAN address during development', () => {
    expect(resolveSkySocketEndpoint({
      configuredUrl: 'http://localhost:8000',
      environment: 'development',
      hostname: '192.168.1.42',
    })).toBe('http://192.168.1.42:8000');
  });

  test('keeps localhost when the browser is running on the same computer', () => {
    expect(resolveSkySocketEndpoint({
      configuredUrl: 'http://localhost:8000',
      environment: 'development',
      hostname: 'localhost',
    })).toBe('http://localhost:8000');
  });

  test('uses the deployed backend instead of a baked-in localhost URL in production', () => {
    expect(resolveSkySocketEndpoint({
      configuredUrl: 'http://localhost:8000',
      baseUrl: 'https://ltc-service.onrender.com',
      environment: 'production',
      hostname: 'letterstocasper.com',
    })).toBe('https://ltc-service.onrender.com');
  });

  test('creates a LAN endpoint when no development URL is configured', () => {
    expect(resolveSkySocketEndpoint({
      configuredUrl: '',
      environment: 'development',
      hostname: '10.0.0.15',
    })).toBe('http://10.0.0.15:8000');
  });
});
