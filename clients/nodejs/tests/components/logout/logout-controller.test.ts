import { Request, Response } from 'express';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Create the mock function before any imports
const mockBuildEndSessionUrl = jest.fn();

// Type for openid-client Configuration
type Configuration = {
  issuer: string;
  // Add other properties as needed
};

// Type for EndSessionParameters
type EndSessionParameters = {
  post_logout_redirect_uri?: string;
  id_token_hint?: string;
  state?: string;
};

// Mock the openid-client module with proper types
jest.mock('openid-client', () => {
  return {
    // Strongly typed mock function that matches the signature in your controller
    buildEndSessionUrl: mockBuildEndSessionUrl as unknown as 
      (config: Configuration, params: EndSessionParameters) => URL
  };
});

jest.mock('../../../src/logger.js', () => ({
  logger: {
    debug: jest.fn()
  }
}));

// Import after mocks are set up
import { logoutController } from '../../../src/components/logout/logout-controller.js';

describe('logoutController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  
  beforeEach(() => {
    // Setup request and response objects
    req = {
      cookies: {
        state: 'test-state',
        'id-token': 'test-id-token'
      },
      session: {
        user: { sub: 'test-user' },
        destroy: jest.fn((callback: (err?: any) => void) => callback())
      } as any
    };
    
    res = {
      redirect: jest.fn()
    };
    
    next = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set the return value for buildEndSessionUrl
    mockBuildEndSessionUrl.mockReturnValue(
      new URL('http://test-issuer.com/logout')
    );
  });
  
  test('should build logout URL and redirect user', async () => {
    await logoutController(req as Request, res as Response, next);
    
    expect(mockBuildEndSessionUrl).toHaveBeenCalled();
    expect(req.session?.destroy).toHaveBeenCalled();
    expect(req.session?.user).toBeNull();
    expect(res.redirect).toHaveBeenCalledWith('http://test-issuer.com/logout/');
  });
  
  test('should handle errors and pass to next middleware', async () => {
    const error = new Error('Logout error');
    mockBuildEndSessionUrl.mockImplementation(() => {
      throw error;
    });
    
    await logoutController(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});