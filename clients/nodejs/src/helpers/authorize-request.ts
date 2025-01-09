import * as openidClient from "openid-client";
import { Response } from "express";
import { Config } from "../config.js";

export const getAuthorizeParameters = (
    clientConfig : Config,
    res: Response,
    idvRequired: boolean): Record<string, string> => {

    // Store the nonce and state in a session cookie so it can be checked in callback
    const generatedNonce = openidClient.randomNonce();
    res.cookie("nonce", generatedNonce, {
        httpOnly: true,
    });

    const generatedState = openidClient.randomState();
    res.cookie("state", generatedState, {
        httpOnly: true,
    });

    let vtr: string;
    if (idvRequired) {
        vtr = JSON.stringify([clientConfig.getIdentityVtr()]);
    } else {
        vtr = JSON.stringify([clientConfig.getAuthenticationVtr()]);    
    }

    let parameters: Record<string, string> = {
        redirect_uri: clientConfig.getAuthorizeRedirectUrl(),
        scope: clientConfig.getScopes().join(" "),
        vtr: vtr,
        nonce: generatedNonce,
        state: generatedState
    }

    if (idvRequired) {
        const claims = clientConfig.getClaims();

        const result = {
            userinfo: Object.fromEntries(
                claims.map(claim => [claim, null])
            )
        };

        parameters["claims"] = JSON.stringify(result);
    }

    return parameters;
}