import { Request, Response } from 'express';
import { callbackController } from '../../../src/components/callback/callback-controller.js';
import * as openidClient from 'openid-client';
import * as jose from 'jose';
import * as cryptoHelper from '../../../src/helpers/crypto.js';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Define interfaces for better typing of mocks
interface MockKeyLike {
  type: string;
  extractable: boolean;
  algorithm: {
    name: string;
  };
}

interface MockTokenSet {
  id_token: string;
  access_token: string;
  claims: () => Record<string, any>;
}

interface MockUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  'https://vocab.account.gov.uk/v1/coreIdentityJWT'?: string;
}

// Mocks
jest.mock('openid-client');
jest.mock('jose');
jest.mock('../../../src/helpers/crypto.js');
jest.mock('../../../src/logger.js', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn()
  }
}));

describe('callbackController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  
  // Create typed mock functions
  const mockAuthorizationCodeGrant = jest.fn<() => Promise<MockTokenSet>>();
  const mockFetchUserInfo = jest.fn<() => Promise<MockUserInfo>>();
  const mockDecodeJwt = jest.fn<() => Record<string, any>>();
  const mockGetKidFromTokenHeader = jest.fn<() => string>();
  const mockGetIdentitySigningPublicKey = jest.fn<() => Promise<MockKeyLike>>();
  const mockJwtVerify = jest.fn<() => Promise<{ payload: Record<string, any> }>>();
  
  beforeEach(() => {
    // Setup request and response objects
    // Create a more strongly typed mock function for req.get
    const mockReqGet = jest.fn<(name: string) => string>().mockImplementation((name: string) => {
      if (name === 'host') return 'localhost:8080';
      return '';
    });

    req = {
      query: {},
      cookies: {
        nonce: 'test-nonce',
        state: 'test-state'
      },
      protocol: 'http',
      get: mockReqGet as any,
      originalUrl: '/oidc/authorization-code/callback',
      session: {
        user: null
      } as any
    };
    
    res = {
      redirect: jest.fn(),
      cookie: jest.fn().mockReturnThis()
    } as Partial<Response>;
    
    next = jest.fn();
    
    // Assign mock implementations
    (openidClient.authorizationCodeGrant as jest.Mock) = mockAuthorizationCodeGrant;
    (openidClient.fetchUserInfo as jest.Mock) = mockFetchUserInfo;
    (jose.decodeJwt as jest.Mock) = mockDecodeJwt;
    (cryptoHelper.getKidFromTokenHeader as jest.Mock) = mockGetKidFromTokenHeader;
    (cryptoHelper.getIdentitySigningPublicKey as jest.Mock) = mockGetIdentitySigningPublicKey;
    (jose.jwtVerify as jest.Mock) = mockJwtVerify;
    
    // Setup mock return values
    mockAuthorizationCodeGrant.mockResolvedValue({
      id_token: 'test-id-token',
      access_token: 'test-access-token',
      claims: jest.fn().mockReturnValue({ sub: 'test-subject' })
    });
    
    mockFetchUserInfo.mockResolvedValue({
      sub: 'test-subject',
      email: 'test@example.com',
      email_verified: true
    });
    
    mockDecodeJwt.mockReturnValue({
      sub: 'test-subject',
      iss: 'http://test-issuer.com/'
    });
    
    mockGetKidFromTokenHeader.mockReturnValue('test-kid');
    mockGetIdentitySigningPublicKey.mockResolvedValue({
      type: 'public',
      extractable: true,
      algorithm: { name: 'ECDSA' }
    } as MockKeyLike);
    
    mockJwtVerify.mockResolvedValue({
      payload: {
        sub: 'test-subject',
        aud: 'test-client-id',
        vot: 'P2'
      }
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('should handle error in query parameters', async () => {
    req.query = {
      error: 'invalid_request',
      error_description: 'Test error description'
    };
    
    await callbackController(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(Error));

    // Cast to Error to access the message property
    const error = next.mock.calls[0][0] as Error;
    expect(error.message).toContain('invalid_request');
    expect(mockAuthorizationCodeGrant).not.toHaveBeenCalled();
  });
  
  test('should successfully process callback and redirect to home', async () => {
    await callbackController(req as Request, res as Response, next);
    
    expect(mockAuthorizationCodeGrant).toHaveBeenCalled();
    expect(mockFetchUserInfo).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith('id-token', 'test-id-token', { httpOnly: true });
    expect(req.session?.user).toBeDefined();
    expect(res.redirect).toHaveBeenCalledWith('/home');
  });
  
  test('should handle coreIdentityJWT validation', async () => {
    // Mock userinfo response with coreIdentityJWT
    mockFetchUserInfo.mockResolvedValue({
      sub: 'test-subject',
      email: 'test@example.com',
      'https://vocab.account.gov.uk/v1/coreIdentityJWT': 'test-core-identity-jwt'
    });
    
    await callbackController(req as Request, res as Response, next);
    
    expect(mockGetKidFromTokenHeader).toHaveBeenCalled();
    expect(mockGetIdentitySigningPublicKey).toHaveBeenCalled();
    expect(mockJwtVerify).toHaveBeenCalled();
    expect(req.session?.user.coreIdentity).toBeDefined();
    expect(res.redirect).toHaveBeenCalledWith('/home');
  });
  
  test('should redirect to identity verification if needed', async () => {
    // Mock config for immediate redirect
    const originalEnv = process.env.IMMEDIATE_REDIRECT;
    process.env.IMMEDIATE_REDIRECT = 'true';
    
    await callbackController(req as Request, res as Response, next);
    
    expect(res.redirect).toHaveBeenCalledWith('/oidc/verify');
    
    // Restore environment
    process.env.IMMEDIATE_REDIRECT = originalEnv;
  });
  
  test('should handle Post Office redirect', async () => {
    (req.cookies ?? {})['post-office'] = 'true';
    
    await callbackController(req as Request, res as Response, next);
    
    expect(res.redirect).toHaveBeenCalledWith('/post-office-return');
  });
  
  test('should handle error in token verification', async () => {
    const error = new Error('Token verification failed');
    mockAuthorizationCodeGrant.mockRejectedValue(error);
    
    await callbackController(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});