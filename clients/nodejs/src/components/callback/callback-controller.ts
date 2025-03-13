import * as openidClient from "openid-client";
import { NextFunction, Request, Response } from "express";
import { Config } from "../../config.js";
import { decodeJwt, jwtVerify } from "jose";
import { getKidFromTokenHeader, getIdentitySigningPublicKey } from "../../helpers/crypto.js";
import { logger } from "../../logger.js";

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
        //const oidcConfig: openidClient.Configuration = clientConfig.getOpenidClientConfiguration();
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

        const idTokenSub = tokens.claims().sub;
        const userinfoResponse: openidClient.UserInfoResponse = await openidClient.fetchUserInfo(
            clientConfig.getOpenidClientConfiguration(), 
            tokens.access_token, 
            idTokenSub
        );
        
        let coreIdentityPayload;
        let coreIdentityJWT;

        let returnCodeValue: openidClient.JsonValue | undefined;
        if (userinfoResponse.hasOwnProperty("https://vocab.account.gov.uk/v1/returnCode")) {
            returnCodeValue = userinfoResponse["https://vocab.account.gov.uk/v1/returnCode"];
        }

        //check for a coreIdentityJWT
        if (userinfoResponse.hasOwnProperty("https://vocab.account.gov.uk/v1/coreIdentityJWT")) {
        
            coreIdentityJWT = userinfoResponse["https://vocab.account.gov.uk/v1/coreIdentityJWT"].toString() || "";
            logger.debug(coreIdentityJWT);
            
            const kid: string = getKidFromTokenHeader(coreIdentityJWT);
            const ivPublicKey = await getIdentitySigningPublicKey(clientConfig, kid);
        
            //decode the coreIdentity
            const { payload } = await jwtVerify(
                coreIdentityJWT!, 
                ivPublicKey, 
                {
                    issuer: clientConfig.getIvIssuer()
                }
            );

            // validate the coreIdentity data
            let vtrToCheck: string;
            const vtr = clientConfig.getIdentityVtr();
            const regex = /[.Clm]/g;

            if (vtr != null) {
                vtrToCheck = vtr?.replace(regex,"");
            }
            
            // Check that the sub in the coreIdentity sub matches the one in the idToken and userinfo
            if (payload.sub === idTokenSub && payload.sub === userinfoResponse.sub) {
                logger.debug("All subs match");
            } else {
                const msg: string = "coreIdentityJWTValidationFailed: unexpected \"sub\" claim value";
                logger.debug(msg);
                throw new Error(msg);
            }

            // Check aud = client-id
            if (payload.aud !== clientConfig.getClientId()) {
                throw new Error("coreIdentityJWTValidationFailed: unexpected \"aud\" claim value");
            }
            
            // Check the Vector of Trust (vot) to ensure the expected level of confidence was achieved.
            if (payload.vot !== vtrToCheck) {
                // if we get one of these we may also have a return code so return that in the error
                let errorMessage: string = `coreIdentityJWTValidationFailed: unexpected \"vot\" claim value ${payload.vot} returned, expected ${vtrToCheck}.`;
                if (returnCodeValue !== undefined) {
                    errorMessage = errorMessage + `returnCode value was ${JSON.stringify(returnCodeValue)}`
                }
                throw new Error(errorMessage);
            }
            coreIdentityPayload = payload;
        }

        req.session.user = { 
            sub: idTokenSub, 
            idToken: decodeJwt(tokens.id_token), 
            accessToken: decodeJwt(tokens.access_token),        
            userinfo: userinfoResponse,
            coreIdentity: coreIdentityPayload,
            returnCode: returnCodeValue
        };

        const postOffice: boolean = req.cookies["post-office"];

        if (clientConfig.getImmediateRedirect() && clientConfig.getIdentitySupported() && coreIdentityPayload === undefined) {
            res.redirect("/oidc/verify");
        // Need a way of determining if the user came via email and landing-page e.g. store in session
        } else if(postOffice) {            
            res.redirect("/post-office-return");
        } else {
            res.redirect("/home");
        }

    } catch (error) {
        next(error);
    }    
};