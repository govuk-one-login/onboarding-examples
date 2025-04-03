import { createApp } from '../src/app.js';
import request from 'supertest';
import express from 'express';
import { Config } from '../src/config.js';
import * as authorizeController from '../src/components/authorize/authorize-controller.js';
import * as callbackController from '../src/components/callback/callback-controller.js';
import * as logoutController from '../src/components/logout/logout-controller.js';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mocks
jest.mock('../src/components/authorize/authorize-controller.js');
jest.mock('../src/components/callback/callback-controller.js');
jest.mock('../src/components/logout/logout-controller.js');
jest.mock('express-session', () => {
  return () => (req, res, next) => {
    req.session = {
      save: (callback) => callback && callback()
    };
    next();
  };
});

describe('App', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // Reset the Config singleton
    Config.resetInstance();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh app
    app = createApp();
    
    // Mock controller implementations
    (authorizeController.authorizeController as jest.Mock).mockImplementation((req: express.Request, res: express.Response) => {
      res.send('Authorize controller called');
    });
    
    (callbackController.callbackController as jest.Mock).mockImplementation((req: express.Request, res: express.Response) => {
      res.send('Callback controller called');
    });
    
    (logoutController.logoutController as jest.Mock).mockImplementation((req: express.Request, res: express.Response) => {
      res.send('Logout controller called');
    });
  });
  
  test('should redirect / to /start', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/start');
  });
  
  test('should call authorize controller for login route', async () => {
    await request(app).get('/oidc/login');
    
    expect(authorizeController.authorizeController).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      false
    );
  });
  
  test('should call authorize controller for verify route with verification enabled', async () => {
    await request(app).get('/oidc/verify');
    
    expect(authorizeController.authorizeController).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      true
    );
  });
  
  test('should call callback controller for callback route', async () => {
    await request(app).get('/oidc/authorization-code/callback');
    
    expect(callbackController.callbackController).toHaveBeenCalled();
  });
  
  test('should call logout controller for logout route', async () => {
    await request(app).get('/oidc/logout');
    
    expect(logoutController.logoutController).toHaveBeenCalled();
  });
  
  test('should handle landing page for post office flow', async () => {
    // Mock for authorizeController to not interfere with response
    (authorizeController.authorizeController as jest.Mock).mockImplementation((req: express.Request, res: express.Response, next: express.NextFunction, verify) => {
      // Check that the cookie was set
      expect(res.get('Set-Cookie')).toContain('post-office=true');
      // Call next to continue
      next();
    });
    
    const response = await request(app).get('/landing-page');
    
    expect(authorizeController.authorizeController).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      false
    );
  });
  
  test('should handle error with custom error handler', async () => {
    // Create an error scenario by making a controller throw
    (authorizeController.authorizeController as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    const response = await request(app).get('/oidc/login');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Test error'); // Our error template contains the error message
  });
});