import * as openidClient from "openid-client";
import { Request, Response } from "express";
import { Config } from "../../config.js";
import { getAuthorizeParameters } from "../../helpers/authorize-request.js";
import { getPrivateKey } from "../../helpers/crypto.js";
import { getDiscoveryMetadata } from "../../helpers/discovery-request.js";
import { NextFunction } from "express-serve-static-core";

export const authorizeController = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    
    try {
        const clientConfig = Config.getInstance();
        let privateKey: CryptoKey | null;

        privateKey = await getPrivateKey(clientConfig.getPrivateKey());

        let openidClientConfiguration : openidClient.Configuration = await getDiscoveryMetadata(clientConfig, privateKey)
        const parameters = getAuthorizeParameters(clientConfig, res);
        let redirectTo: URL;
        
        redirectTo = openidClient.buildAuthorizationUrl(openidClientConfiguration, parameters);
        res.redirect(redirectTo.href);
    } catch (error) {
        // Unexpected errors
        next(error);
    }    
}