import { UserIdentityClaim } from "./user-info.js";
import * as openidClient from "openid-client";
import DIDKeySet from "../types/did-keyset.js";

export default interface ClientConfiguration {
  clientId?: string;
  privateKey?: string;
  clientSecret?: string;
  issuer?: string;
  discoveryUrl?: string;
  ivIssuer?: string;
  ivDidUri?: string;
  ivPublicKeys?: DIDKeySet[];
  scopes: string[];
  authorizeRedirectUrl?: string;
  postLogoutRedirectUrl?: string;
  claims: UserIdentityClaim[];
  idTokenSigningAlgorithm: string;
  tokenAuthMethod: string;
  authenticationVtr: string;
  identityVtr: string;
  uiLocales: string;
  serviceUrl?: string;
  openidClientConfiguration?: openidClient.Configuration;
  immediateRedirect: boolean;
  requireJAR: boolean;
}