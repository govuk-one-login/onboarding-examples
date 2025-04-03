import { Config } from '../src/config.js';
import DIDKeySet from '../src/types/did-keyset.js';
import { describe, test, expect, beforeEach } from '@jest/globals';

// Reset singleton between tests
beforeEach(() => {
  Config.resetInstance();
});

describe('Config', () => {
  test('getInstance returns singleton instance', () => {
    const instance1 = Config.getInstance();
    const instance2 = Config.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('getClientId returns the client ID from environment variables', () => {
    const config = Config.getInstance();
    expect(config.getClientId()).toBe('test-client-id');
  });

  test('getIssuer returns the issuer from environment variables', () => {
    const config = Config.getInstance();
    expect(config.getIssuer()).toBe('http://test-issuer.com/');
  });

  test('getDiscoveryUrl returns discovery URL based on issuer', () => {
    const config = Config.getInstance();
    expect(config.getDiscoveryUrl()).toBe('http://test-issuer.com/.well-known/openid-configuration');
  });

  test('getScopes returns the correct scopes array', () => {
    const config = Config.getInstance();
    expect(config.getScopes()).toEqual(['openid', 'email', 'phone']);
  });

  test('getAuthorizeRedirectUrl replaces port placeholder', () => {
    // Mock environment
    const originalEnv = process.env.NODE_PORT;
    process.env.NODE_PORT = '9999';
    
    // Reset config to pick up the new environment
    Config.resetInstance();
    const config = Config.getInstance();
    
    // Override the redirect URL to include the port placeholder
    Object.defineProperty(config, 'clientConfiguration', {
      value: {
        ...config['clientConfiguration'],
        authorizeRedirectUrl: 'http://localhost:port/callback'
      },
      writable: true
    });
    
    expect(config.getAuthorizeRedirectUrl()).toBe('http://localhost:9999/callback');
    
    // Restore environment
    process.env.NODE_PORT = originalEnv;
  });

  test('setIvPublicKeys and getIvPublicKeys should store and retrieve keys', () => {
    const config = Config.getInstance();
    const mockKeys: DIDKeySet[] = [
      {
        id: 'key-1',
        publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x', y: 'test-y' }
      }
    ];
    
    config.setIvPublicKeys(mockKeys);
    expect(config.getIvPublicKeys()).toEqual(mockKeys);
  });

  test('getIdentitySupported returns boolean based on environment variable', () => {
    // Test when variable is "true"
    process.env.IDENTITY_SUPPORTED = 'true';
    Config.resetInstance();
    let config = Config.getInstance();
    expect(config.getIdentitySupported()).toBe(true);
    
    // Test when variable is "false"
    process.env.IDENTITY_SUPPORTED = 'false';
    Config.resetInstance();
    config = Config.getInstance();
    expect(config.getIdentitySupported()).toBe(false);
    
    // Restore
    process.env.IDENTITY_SUPPORTED = 'true';
  });
});