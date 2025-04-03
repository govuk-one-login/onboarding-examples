import { AuthenticatedUser, isAuthenticated, VerifiedUser, isVerified } from '../../src/helpers/user-status.js';
import { Request, Response } from 'express';
import { jest } from '@jest/globals';

describe('User Status Helper', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  
  beforeEach(() => {
    mockReq = {
      session: {} as any
    };
    
    mockRes = {
      redirect: jest.fn()
    };
    
    mockNext = jest.fn();
  });
  
  describe('AuthenticatedUser', () => {
    test('should call next if user is authenticated', () => {
      mockReq.session.user = { sub: 'test-user' };
      
      AuthenticatedUser(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });
    
    test('should redirect to login if user is not authenticated', () => {
      mockReq.session.user = undefined;
      
      AuthenticatedUser(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.redirect).toHaveBeenCalledWith('/oidc/login');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
  
  describe('isAuthenticated', () => {
    test('should return true if user is authenticated', () => {
      mockReq.session.user = { sub: 'test-user' };
      
      const result = isAuthenticated(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(true);
    });
    
    test('should return false if user is not authenticated', () => {
      mockReq.session.user = undefined;
      
      const result = isAuthenticated(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });
  });
  
  describe('VerifiedUser', () => {
    test('should call next if user has coreidentity', () => {
      mockReq.session.user = { 
        sub: 'test-user',
        coreidentity: { name: 'Test User' } 
      };
      
      VerifiedUser(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });
    
    test('should call next if user has returnCode', () => {
      mockReq.session.user = { 
        sub: 'test-user',
        returnCode: 'test-code' 
      };
      
      VerifiedUser(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });
    
    test('should redirect to verify if user has no identity information', () => {
      mockReq.session.user = { sub: 'test-user' };
      
      VerifiedUser(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.redirect).toHaveBeenCalledWith('/oidc/verify');
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    test('should redirect to verify if user is not authenticated', () => {
      mockReq.session.user = undefined;
      
      VerifiedUser(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.redirect).toHaveBeenCalledWith('/oidc/verify');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
  
  describe('isVerified', () => {
    test('should return true if user has coreidentity', () => {
      mockReq.session.user = { 
        sub: 'test-user',
        coreidentity: { name: 'Test User' } 
      };
      
      const result = isVerified(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(true);
    });
    
    test('should return false if user has no coreidentity', () => {
      mockReq.session.user = { sub: 'test-user' };
      
      const result = isVerified(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });
    
    test('should return false if user is not authenticated', () => {
      mockReq.session.user = undefined;
      
      const result = isVerified(mockReq as Request, mockRes as Response);
      
      expect(result).toBe(false);
    });
  });
});