import ClientConfiguration from "./types/client-configuration.js";
import { UserIdentityClaim } from "./types/user-info.js";
import * as openidClient from "openid-client";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import DIDKeySet from "./types/did-keyset.js";

export class Config {
    private static instance: Config;

    private clientConfiguration: ClientConfiguration;
    
    private constructor() {
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        // Load the .env file
        dotenv.config();
        
        this.clientConfiguration = {
            clientId: process.env.OIDC_CLIENT_ID ?? "",
            privateKey: process.env.OIDC_PRIVATE_KEY ?? "",
            clientSecret: process.env.OIDC_CLIENT_SECRET ?? "",           
            issuer: process.env.OIDC_ISSUER ?? "https://oidc.integration.account.gov.uk",
            discoveryUrl: process.env.OIDC_ISSUER 
                ? process.env.OIDC_ISSUER + "/.well-known/openid-configuration" 
                : "https://oidc.integration.account.gov.uk/.well-known/openid-configuration",
            ivIssuer: process.env.IV_ISSUER ?? "",
            ivDidUri: process.env.IV_DID_URI ?? "",
            scopes: process.env.OIDC_SCOPES
             ? process.env.OIDC_SCOPES.split(",")
             : ["openid", "email", "phone"],
            authorizeRedirectUrl: process.env.OIDC_AUTHORIZE_REDIRECT_URL ?? "",
            postLogoutRedirectUrl: process.env.OIDC_POST_LOGOUT_REDIRECT_URL ?? "",
            claims: process.env.OIDC_CLAIMS
                ? (process.env.OIDC_CLAIMS.split(",") as UserIdentityClaim[])
                : ["https://vocab.account.gov.uk/v1/coreIdentityJWT"],
            idTokenSigningAlgorithm: process.env.OIDC_ID_TOKEN_SIGNING_ALG ?? "ES256",
            tokenAuthMethod: process.env.OIDC_TOKEN_AUTH_METHOD ?? "private_key_jwt",
            authenticationVtr: process.env.AUTH_VECTOR_OF_TRUST ?? "Cl.Cm",
            identityVtr: process.env.IDENTITY_VECTOR_OF_TRUST ?? "Cl.Cm.P2",
            uiLocales: process.env.UI_LOCALES ?? "en",
            serviceUrl: process.env.SERVICE_URL ?? "",
            immediateRedirect: process.env.IMMEDIATE_REDIRECT == "true",
            requireJAR: process.env.REQUIRE_JAR == "true"
        };
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    
    public static resetInstance(): void {
        Config.instance = new Config();
    }
    public getClientId(): string {
        return this.clientConfiguration.clientId!;
      }

    public getPrivateKey(): string {
        return this.clientConfiguration.privateKey!;
    }

    public getClientSecret(): string {
        return this.clientConfiguration.clientSecret!;
    }

    public getIssuer(): string {
        return this.clientConfiguration.issuer!;
    }

    public getDiscoveryUrl(): string {
        return this.clientConfiguration.discoveryUrl!;
    }

    public getIvIssuer(): string {
        return this.clientConfiguration.ivIssuer!;
    }

    public getIvDidUri(): string {
        return this.clientConfiguration.ivDidUri!;
    }

    public getIvPublicKeys(): DIDKeySet[] {
        return this.clientConfiguration.ivPublicKeys;
    }

    public setIvPublicKeys(ivPublicKeys: DIDKeySet[]): void {
        this.clientConfiguration.ivPublicKeys = ivPublicKeys;
    }

    public getScopes(): string[] {
        return this.clientConfiguration.scopes!;
    }

    public getAuthorizeRedirectUrl(): string {
        return this.clientConfiguration.authorizeRedirectUrl!;
    }

    public getPostLogoutRedirectUrl(): string {
        return this.clientConfiguration.postLogoutRedirectUrl!;
    }

    public getClaims(): UserIdentityClaim[] {
        return this.clientConfiguration.claims!;
    }

    public getIdTokenSigningAlgorithm(): string {
        return this.clientConfiguration.idTokenSigningAlgorithm!;
    }

    public getTokenAuthMethod(): string {
        return this.clientConfiguration.tokenAuthMethod!;
    }

    public getAuthenticationVtr(): string {
        return this.clientConfiguration.authenticationVtr!;
    }
    public getIdentityVtr(): string {
        return this.clientConfiguration.identityVtr!;
    }
    public getUiLocales(): string {
        return this.clientConfiguration.uiLocales!;
    }

    public getServiceUrl(): string {
        return this.clientConfiguration.uiLocales!;
    }

    public getOpenidClientConfiguration(): openidClient.Configuration {
        return this.clientConfiguration.openidClientConfiguration!;
    }

    public setOpenidClientConfiguration(openidClientConfiguration: openidClient.Configuration): void {
        this.clientConfiguration.openidClientConfiguration = openidClientConfiguration;
    }

    public getImmediateRedirect(): boolean {
        return this.clientConfiguration.immediateRedirect;
    }

    public getRequireJAR(): boolean {
        return this.clientConfiguration.requireJAR;
    }
}