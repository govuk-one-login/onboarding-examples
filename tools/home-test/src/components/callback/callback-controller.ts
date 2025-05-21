import * as openidClient from "openid-client";
import { NextFunction, Request, Response } from "express";
import { Config } from "../../config.js";

export const callbackController = async (
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    
    try {
        // Check for an error
        if (req.query["error"]) {
            throw new Error(`${req.query.error} - ${req.query.error_description}`);
        }

        const clientConfig = Config.getInstance();
        
        let nonce = req.cookies["nonce"];
        let state = req.cookies["state"];

        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        let currentUrl: URL = new URL(fullUrl);
        let tokens = await openidClient.authorizationCodeGrant(
            clientConfig.getOpenidClientConfiguration(), 
            currentUrl, 
            {
                expectedNonce: nonce,
                expectedState: state,
                idTokenExpected: true,
            }
        )

        const idToken = tokens.id_token;
        res.cookie("id-token", idToken, {
            httpOnly: true,
        });

        res.redirect("/your-services");
    
    } catch (error) {
        next(error);
    }    
};