import * as openidClient from "openid-client";
import { Config } from "../config.js";

export const getDiscoveryMetadata = async (
    clientConfig: Config,
    privateKey: CryptoKey | null,
    clientSecret: string | null,
) : Promise<openidClient.Configuration> => {
    
    let openidClientConfiguration : openidClient.Configuration;

    if (clientConfig.getOpenidClientConfiguration !== undefined) {
        let clientMetadata!: Partial<openidClient.ClientMetadata> | string | undefined
        const issuer: string = clientConfig.getIssuer()

        if (privateKey) {
            // Modify the audience claim in the private_key_jwt            
            let substituteAudience: openidClient.ModifyAssertionOptions = {
                [openidClient.modifyAssertion]: (header, _payload) => {
                    _payload.aud = `${issuer}token`
                }
            };

            // call discovery endpoint and setup private_key_jwt
            // use allowInsecureRequests if connecting to HTTP endpoint e.g. when running simulator locally
            openidClientConfiguration = await openidClient.discovery(
                new URL(issuer), 
                clientConfig.getClientId(),
                clientMetadata,
                openidClient.PrivateKeyJwt(privateKey, substituteAudience),
                {
                    execute: [openidClient.allowInsecureRequests]
                }
            );
        } else {
            // call discovery endpoint and setup private_key_jwt
            // use allowInsecureRequests if connecting to HTTP endpoint e.g. when running simulator locally
            openidClientConfiguration = await openidClient.discovery(
                new URL(issuer), 
                clientConfig.getClientId(),
                clientMetadata,
                openidClient.ClientSecretPost(clientSecret),
                {
                    execute: [openidClient.allowInsecureRequests]
                }
            );
        }
        clientConfig.setOpenidClientConfiguration(openidClientConfiguration);
    } else {
        openidClientConfiguration = clientConfig.getOpenidClientConfiguration();
    }

    return openidClientConfiguration;
}