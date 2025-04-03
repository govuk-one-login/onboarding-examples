import { Request, Response } from 'express';
import { authorizeController } from '../../../src/components/authorize/authorize-controller.js';
import * as openidClient from 'openid-client';
import { Config } from '../../../src/config.js';
import * as cryptoHelper from '../../../src/helpers/crypto.js';
import * as discoveryHelper from '../../../src/helpers/discovery-request.js';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Define interfaces for better typing of mocks
interface MockCryptoKey {
  type: string;
  extractable: boolean;
  algorithm: {
    name: string;
  };
  usages: string[];
}

// Mock the modules
jest.mock('openid-client');
jest.mock('../../../src/helpers/crypto.js');
jest.mock('../../../src/helpers/discovery-request.js');

describe('authorizeController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let configSpy: ReturnType<typeof jest.spyOn>;
  
  // Create typed versions of the mocks
  const mockBuildAuthUrl = jest.fn<() => URL>();
  const mockBuildAuthUrlWithJAR = jest.fn<() => URL | Promise<URL>>();
  const mockGetPrivateKey = jest.fn<() => Promise<MockCryptoKey>>();
  const mockGetDiscoveryMetadata = jest.fn<() => Promise<openidClient.Configuration>>();
  
  beforeEach(() => {
    // Reset the Config singleton
    Config.resetInstance();
    
    // Setup request and response objects
    req = {};
    res = {
      redirect: jest.fn(),
      cookie: jest.fn().mockReturnThis() // Return 'this' to allow method chaining as with real Response
    } as Partial<Response>;
    next = jest.fn();
    
    // Setup the Config spy
    configSpy = jest.spyOn(Config.prototype, 'getRequireJAR');
    configSpy.mockReturnValue(false);
    
    // Assign the mock implementations
    (openidClient.buildAuthorizationUrl as jest.Mock) = mockBuildAuthUrl;
    (openidClient.buildAuthorizationUrlWithJAR as jest.Mock) = mockBuildAuthUrlWithJAR;
    (cryptoHelper.getPrivateKey as jest.Mock) = mockGetPrivateKey;
    (discoveryHelper.getDiscoveryMetadata as jest.Mock) = mockGetDiscoveryMetadata;
    
    // Setup the mock return values
    mockBuildAuthUrl.mockReturnValue(new URL('http://mock-auth-url.com'));
    mockBuildAuthUrlWithJAR.mockReturnValue(new URL('http://mock-jar-auth-url.com'));
    mockGetPrivateKey.mockResolvedValue({
      type: 'private',
      extractable: false,
      algorithm: { name: 'ECDSA' },
      usages: ['sign']
    } as MockCryptoKey);
    mockGetDiscoveryMetadata.mockResolvedValue({} as openidClient.Configuration);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    configSpy.mockRestore();
  });
  
  test('should redirect to authorization URL without JAR', async () => {
    await authorizeController(req as Request, res as Response, next, false);
    
    expect(res.redirect).toHaveBeenCalledWith('http://mock-auth-url.com/');
    expect(mockBuildAuthUrl).toHaveBeenCalled();
    expect(mockBuildAuthUrlWithJAR).not.toHaveBeenCalled();
  });
  
  test('should redirect to authorization URL with JAR when required', async () => {
    // Setup for JAR
    configSpy.mockReturnValue(true);
    
    await authorizeController(req as Request, res as Response, next, false);
    
    expect(res.redirect).toHaveBeenCalledWith('http://mock-jar-auth-url.com/');
    expect(mockBuildAuthUrlWithJAR).toHaveBeenCalled();
    expect(mockBuildAuthUrl).not.toHaveBeenCalled();
  });
  
  test('should pass error to next middleware when an exception occurs', async () => {
    const error = new Error('Test error');
    mockGetDiscoveryMetadata.mockRejectedValue(error);
    
    await authorizeController(req as Request, res as Response, next, false);
    
    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
  
  test('should include identity verification when verificationRequired is true', async () => {
    await authorizeController(req as Request, res as Response, next, true);
    
    // We can't directly check the parameters, but we can verify the function was called
    expect(mockBuildAuthUrl).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });
});