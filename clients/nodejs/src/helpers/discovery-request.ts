import * as openidClient from "openid-client";
import { Config } from "../config.js";

export const getDiscoveryMetadata = async (
    clientConfig: Config,
    privateKey: CryptoKey
) : Promise<openidClient.Configuration> => {
    
    let openidClientConfiguration : openidClient.Configuration;

    if (clientConfig.getOpenidClientConfiguration !== undefined) {
        let clientMetadata!: Partial<openidClient.ClientMetadata> | string | undefined

        // Modify the audience claim in the private_key_jwt
        const issuer: string = clientConfig.getIssuer()
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
        clientConfig.setOpenidClientConfiguration(openidClientConfiguration);
    } else {
        openidClientConfiguration = clientConfig.getOpenidClientConfiguration();
    }

    return openidClientConfiguration;
}