import { Config } from "../config.js";
import { KeyLike, JWK, importJWK } from "jose";
import DIDKeySet from "../types/did-keyset.js";
import { DIDDocument, DIDResolutionResult, Resolver } from 'did-resolver';
import { getResolver } from 'web-did-resolver';
import { logger } from "../logger.js";
import fetch from "node-fetch";

interface JWTHeader {
  kid?: string;
  alg: string;
  typ: string;
}

export function getKidFromTokenHeader(token: string): string {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the header (first part)
    const header = Buffer.from(parts[0], 'base64url').toString('utf-8');
    const parsed = JSON.parse(header) as JWTHeader;

    return parsed.kid;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse JWT header: ${error.message}`);
    }
    throw error;
  }
}

export const getIdentitySigningPublicKey = async (
  clientConfig: Config, 
  kid: string 
): Promise<KeyLike> => {
  
  let publicKeys: DIDKeySet[] = clientConfig.getIvPublicKeys();    
  const didUri = clientConfig.getIvDidUri();
  const issuer = clientConfig.getIvIssuer();

  if (publicKeys === undefined) {
      publicKeys = await fetchPublicKeys(didUri, issuer);
      clientConfig.setIvPublicKeys(publicKeys);
  }

  // check to see if we have the kid and matching key
  const keySet = clientConfig.getIvPublicKeys().find(keyset => keyset.id === kid);
  let ivJsonWebKey: JsonWebKey;
  if (keySet) {
      ivJsonWebKey = keySet.publicKeyJwk;    
  } else {
      logger.error(`No matching public key found for key id:${kid}`);
      throw new Error("coreIdentityJWTValidationFailed: unexpected \"kid\" found in JWT header");
  }

  try {
    const key: KeyLike | Uint8Array = await importJWK(ivJsonWebKey as JWK, "ES256");

    // Ensure the returned key is KeyLike
    if (key instanceof Uint8Array) {
      throw new Error('Expected KeyLike but got Uint8Array. Check your JWK or algorithm.');
    }

    return key;
  } catch (error) {
    logger.error('Error converting JWK to KeyLike:', error);
    throw error;
  }
}

export const fetchPublicKeys = async (
  did: string,
  issuer: string
): Promise<DIDKeySet[]> => {

    // Download the DID document
    const didResolver = new Resolver(getResolver());
    let didResolutionResult: DIDResolutionResult;
    let didDocument: DIDDocument;

    if (did.includes("localhost")) {
      // bit of a hack to get the DID document from http://localhost
      // didResolver refuses to connect to localhost and http endpoints
      const response = await fetch(issuer + ".well-known/did.json"); // local endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      didDocument = await response.json();
      //return { didDocument, didResolutionMetadata: {}, didDocumentMetadata: {} };
    } else {
      didResolutionResult = await didResolver.resolve("did:web:identity.integration.account.gov.uk");
    }

    // Extract public keys from assertionMethod methods
    // Fetch returns a different structure to the did resolver
    if (didResolutionResult !== undefined) {
      didDocument = didResolutionResult.didDocument;
    }
    const publicKeys: DIDKeySet[] = didDocument.assertionMethod
    .filter(method => {
      // Handle both string and object methods
      if (typeof method === "string") return false;
      return method && "publicKeyJwk" in method;
    })
    .map(method => ({
      id: (method as any).id,
      publicKeyJwk: (method as any).publicKeyJwk
    }));
    return publicKeys;
}

export const getPrivateKey = async (
  privateKeyPem: string
): Promise<CryptoKey> => {
  
  const binaryDer = Buffer.from(privateKeyPem, 'base64');

    // Import the ArrayBuffer as a CryptoKey
    let privateKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
            name: 'RSA-PSS',
            hash: 'SHA-256'
        },
        true, // Whether the key is extractable
        ['sign'] // Key usages (e.g., 'sign' or 'decrypt' for private keys)
    );

    return privateKey;
}