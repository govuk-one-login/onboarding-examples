import * as openidClient from "openid-client";
import { Response } from "express";
import { Config } from "../config.js";

export const getAuthorizeParameters = (
    clientConfig : Config,
    res: Response): Record<string, string> => {

    // Store the nonce and state in a session cookie so it can be checked in callback
    const generatedNonce = openidClient.randomNonce();
    res.cookie("nonce", generatedNonce, {
        httpOnly: true,
    });

    const generatedState = openidClient.randomState();
    res.cookie("state", generatedState, {
        httpOnly: true,
    });

    const vtr = JSON.stringify(["Cl.Cm"]);

    let parameters: Record<string, string> = {
        redirect_uri: clientConfig.getAuthorizeRedirectUrl(),
        scope: "openid",
        vtr: vtr,
        nonce: generatedNonce,
        state: generatedState
    }

    return parameters;
}