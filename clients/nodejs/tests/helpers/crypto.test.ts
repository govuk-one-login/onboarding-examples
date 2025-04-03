import { getKidFromTokenHeader, getIdentitySigningPublicKey, fetchPublicKeys } from '../../src/helpers/crypto.js';
import { Config } from '../../src/config.js';
import { Resolver } from 'did-resolver';
import { importJWK } from 'jose';
import fetch from 'node-fetch';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mocks
jest.mock('did-resolver');
jest.mock('web-did-resolver', () => ({
  getResolver: jest.fn().mockReturnValue({})
}));
jest.mock('jose');
jest.mock('node-fetch');

describe('Crypto Helper', () => {
  // Reset the Config singleton between tests
  beforeEach(() => {
    Config.resetInstance();
    jest.clearAllMocks();
  });
  
  describe('getKidFromTokenHeader', () => {
    test('should extract kid from JWT header', () => {
      // Create a test JWT with a known header
      const header = { kid: 'test-kid', alg: 'ES256', typ: 'JWT' };
      const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
      const jwt = `${headerBase64}.payload.signature`;
      
      const result = getKidFromTokenHeader(jwt);
      
      expect(result).toBe('test-kid');
    });
    
    test('should throw error for invalid JWT format', () => {
      expect(() => getKidFromTokenHeader('invalid-jwt')).toThrow('Invalid JWT format');
    });
    
    test('should throw error if header cannot be parsed', () => {
      // Invalid base64 encoding
      const jwt = 'invalid-base64.payload.signature';
      
      expect(() => getKidFromTokenHeader(jwt)).toThrow();
    });
  });
  
  describe('getIdentitySigningPublicKey', () => {
    test('should return key from cache if available', async () => {
      // Setup mock cached keys
      const config = Config.getInstance();
      const mockKeys = [
        {
          id: 'test-kid',
          publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x', y: 'test-y' }
        }
      ];
      config.setIvPublicKeys(mockKeys);
      
      // Mock importJWK
      // @ts-ignore - bypass TypeScript errors for the mock
      importJWK.mockResolvedValue({ type: 'public' });
      
      const result = await getIdentitySigningPublicKey(config, 'test-kid');
      
      expect(result).toEqual({ type: 'public' });
      expect(importJWK).toHaveBeenCalledWith(
        { kty: 'EC', crv: 'P-256', x: 'test-x', y: 'test-y' },
        'ES256'
      );
    });
    
    test('should throw error if no matching key found', async () => {
      // Setup mock cached keys
      const config = Config.getInstance();
      const mockKeys = [
        {
          id: 'different-kid',
          publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x', y: 'test-y' }
        }
      ];
      config.setIvPublicKeys(mockKeys);
      
      await expect(getIdentitySigningPublicKey(config, 'test-kid')).rejects.toThrow(
        'coreIdentityJWTValidationFailed: unexpected "kid" found in JWT header'
      );
    });
    
    test('should fetch keys if not cached', async () => {
      // Setup config
      const config = Config.getInstance();
      jest.spyOn(config, 'getIvPublicKeys').mockReturnValueOnce(undefined);
      jest.spyOn(config, 'getIvDidUri').mockReturnValue('did:web:test.com');
      jest.spyOn(config, 'getIvIssuer').mockReturnValue('https://test.com/');
      
      // Mock the fetchPublicKeys function
      const mockPublicKeys = [
        {
          id: 'test-kid',
          publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x', y: 'test-y' }
        }
      ];
      
      // Store original function and replace with mock
      const originalFetchPublicKeys = fetchPublicKeys;
      
      // @ts-ignore - Telling TypeScript to ignore this assignment
      fetchPublicKeys = jest.fn().mockResolvedValue(mockPublicKeys);
      
      // Mock importJWK - use ts-ignore to bypass type checking
      // @ts-ignore
      importJWK.mockResolvedValue({ type: 'public' });
      
      try {
        const result = await getIdentitySigningPublicKey(config, 'test-kid');
        
        expect(fetchPublicKeys).toHaveBeenCalledWith('did:web:test.com', 'https://test.com/');
        expect(result).toEqual({ type: 'public' });
      } finally {
        // Restore original function
        // @ts-ignore
        fetchPublicKeys = originalFetchPublicKeys;
      }
    });
  });
  
  describe('fetchPublicKeys', () => {
    test('should fetch keys from DID document for non-localhost URIs', async () => {
      // Mock resolver
      const mockDidDocument = {
        assertionMethod: [
          {
            id: 'test-key-1',
            publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x-1', y: 'test-y-1' }
          },
          {
            id: 'test-key-2',
            publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x-2', y: 'test-y-2' }
          }
        ]
      };
      
      // @ts-ignore - bypass TypeScript errors for the mock
      Resolver.prototype.resolve.mockResolvedValue({
        didDocument: mockDidDocument,
        didResolutionMetadata: {},
        didDocumentMetadata: {}
      });
      
      const result = await fetchPublicKeys('did:web:test.com', 'https://test.com/');
      
      expect(result).toEqual([
        {
          id: 'test-key-1',
          publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x-1', y: 'test-y-1' }
        },
        {
          id: 'test-key-2',
          publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x-2', y: 'test-y-2' }
        }
      ]);
      expect(Resolver.prototype.resolve).toHaveBeenCalledWith('did:web:identity.integration.account.gov.uk');
    });
    
    test('should fetch keys from HTTP endpoint for localhost URIs', async () => {
      // Mock fetch response
      const mockJsonFn = jest.fn();
      // @ts-ignore - bypass TypeScript errors for the mock return value
      mockJsonFn.mockResolvedValue({
        assertionMethod: [
          {
            id: 'test-key-1',
            publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x-1', y: 'test-y-1' }
          }
        ]
      });
      
      const mockResponse = {
        ok: true,
        json: mockJsonFn
      };
      
      // @ts-ignore - bypass TypeScript errors for the mock
      fetch.mockResolvedValue(mockResponse);
      
      const result = await fetchPublicKeys('did:web:localhost', 'http://localhost:3000/');
      
      expect(result).toEqual([
        {
          id: 'test-key-1',
          publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'test-x-1', y: 'test-y-1' }
        }
      ]);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/.well-known/did.json');
    });
    
    test('should handle HTTP errors', async () => {
      // Mock fetch with error
      const mockResponse = {
        ok: false,
        status: 404
      };
      
      // @ts-ignore - bypass TypeScript errors for the mock
      fetch.mockResolvedValue(mockResponse);
      
      await expect(fetchPublicKeys('did:web:localhost', 'http://localhost:3000/')).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });
  });
});