import ClientConfiguration from "./types/client-configuration.js";
import * as openidClient from "openid-client";

export class Config {
    private static instance: Config;

    private clientConfiguration: ClientConfiguration;
    
    private constructor() {
        
        this.clientConfiguration = {
            clientId: process.env.OIDC_CLIENT_ID ?? "",
            privateKey: process.env.OIDC_PRIVATE_KEY ?? "",       
            issuer: process.env.OIDC_ISSUER ?? "https://oidc.integration.account.gov.uk/",
            discoveryUrl: process.env.OIDC_ISSUER 
                ? process.env.OIDC_ISSUER + "/.well-known/openid-configuration" 
                : "https://oidc.integration.account.gov.uk/.well-known/openid-configuration",
            authorizeRedirectUrl: process.env.OIDC_AUTHORIZE_REDIRECT_URL ?? "",
            f2fLandingPageUrl: process.env.F2F_LANDING_PAGE_URL ?? "",
            serviceUrl: process.env.SERVICE_URL ?? ""
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

    public getIssuer(): string {
        return this.clientConfiguration.issuer!;
    }

    public getDiscoveryUrl(): string {
        return this.clientConfiguration.discoveryUrl!;
    }

    public getAuthorizeRedirectUrl(): string {
        let authorizeRedirectUrl = this.clientConfiguration.authorizeRedirectUrl;
        if (authorizeRedirectUrl.includes(":port")) {
            return authorizeRedirectUrl.replace("port", process.env.NODE_PORT || "8080");
        } else {
            return authorizeRedirectUrl;
        }
    }

    public getServiceUrl(): string {
        let serviceUrl = this.clientConfiguration.serviceUrl;
        if (serviceUrl.includes(":port")) {
            return serviceUrl.replace("port", process.env.NODE_PORT || "8080");
        } else {
            return serviceUrl;
        }
    }

    public getOpenidClientConfiguration(): openidClient.Configuration {
        return this.clientConfiguration.openidClientConfiguration!;
    }

    public setOpenidClientConfiguration(openidClientConfiguration: openidClient.Configuration): void {
        this.clientConfiguration.openidClientConfiguration = openidClientConfiguration;
    }

    public getF2FLandingPageUrl(): string {
        return this.clientConfiguration.f2fLandingPageUrl;
    }
}