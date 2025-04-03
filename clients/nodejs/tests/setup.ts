import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Load testing environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables needed for tests
process.env.NODE_ENV = 'test';
process.env.OIDC_CLIENT_ID = 'test-client-id';
process.env.OIDC_ISSUER = 'http://test-issuer.com/';
process.env.OIDC_AUTHORIZE_REDIRECT_URL = 'http://localhost:8080/oidc/authorization-code/callback';
process.env.OIDC_POST_LOGOUT_REDIRECT_URL = 'http://localhost:8080/signed-out';
process.env.SERVICE_URL = 'http://localhost:8080';

// Properly mock global fetch with correct return type
global.fetch = jest.fn<() => Promise<Response>>().mockImplementation(
  async (): Promise<Response> =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: 'http://test-issuer.com'
    } as Response)
);

// Silence console logs during tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();