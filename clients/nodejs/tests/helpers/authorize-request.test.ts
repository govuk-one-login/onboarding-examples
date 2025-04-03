import { getAuthorizeParameters } from '../../src/helpers/authorize-request.js';
import { Config } from '../../src/config.js';
import { Response } from 'express';
import * as openidClient from 'openid-client';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mocks
jest.mock('openid-client', () => ({
  randomNonce: jest.fn().mockReturnValue('test-nonce'),
  randomState: jest.fn().mockReturnValue('test-state')
}));

describe('Authorize Request Helper', () => {
  let mockRes: Partial<Response>;
  let mockConfig: Config;
  
  beforeEach(() => {
    // Reset Config singleton
    Config.resetInstance();
    mockConfig = Config.getInstance();
    
    // Mock response object
    mockRes = {
      cookie: jest.fn((name: string, val: any, options?: any) => mockRes as Response)
    };
    
    // Mock config methods
    jest.spyOn(mockConfig, 'getAuthorizeRedirectUrl').mockReturnValue('http://localhost:8080/callback');
    jest.spyOn(mockConfig, 'getScopes').mockReturnValue(['openid', 'email']);
    jest.spyOn(mockConfig, 'getAuthenticationVtr').mockReturnValue('Cl.Cm');
    jest.spyOn(mockConfig, 'getIdentityVtr').mockReturnValue('Cl.Cm.P2');
    jest.spyOn(mockConfig, 'getClaims').mockReturnValue(['https://vocab.account.gov.uk/v1/coreIdentityJWT']);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('should set nonce and state cookies', () => {
    getAuthorizeParameters(mockConfig, mockRes as Response, false);
    
    expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    expect(mockRes.cookie).toHaveBeenCalledWith('nonce', 'test-nonce', { httpOnly: true });
    expect(mockRes.cookie).toHaveBeenCalledWith('state', 'test-state', { httpOnly: true });
  });
  
  test('should return authentication parameters', () => {
    const result = getAuthorizeParameters(mockConfig, mockRes as Response, false);
    
    expect(result).toEqual({
      redirect_uri: 'http://localhost:8080/callback',
      scope: 'openid email',
      vtr: JSON.stringify(['Cl.Cm']),
      nonce: 'test-nonce',
      state: 'test-state'
    });
  });
  
  test('should return identity verification parameters when idvRequired is true', () => {
    const result = getAuthorizeParameters(mockConfig, mockRes as Response, true);
    
    expect(result).toEqual({
      redirect_uri: 'http://localhost:8080/callback',
      scope: 'openid email',
      vtr: JSON.stringify(['Cl.Cm.P2']),
      nonce: 'test-nonce',
      state: 'test-state',
      claims: JSON.stringify({
        userinfo: {
          'https://vocab.account.gov.uk/v1/coreIdentityJWT': null
        }
      })
    });
  });
  
  test('should use random nonce and state from openid-client', () => {
    getAuthorizeParameters(mockConfig, mockRes as Response, false);
    
    expect(openidClient.randomNonce).toHaveBeenCalled();
    expect(openidClient.randomState).toHaveBeenCalled();
  });
});