import * as openidClient from "openid-client";

export default interface ClientConfiguration {
  clientId?: string;
  privateKey?: string;
  issuer?: string;
  discoveryUrl?: string;
  authorizeRedirectUrl?: string;
  serviceUrl?: string;
  openidClientConfiguration?: openidClient.Configuration;
  f2fLandingPageUrl?: string;
  rpAccountServiceUrl?: string;
  rpAccountServiceUrlText?: string;
  rpAccountServiceName?: string;
  rpAccountServiceDescription?: string;
}