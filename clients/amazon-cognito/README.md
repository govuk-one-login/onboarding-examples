# GOV.UK One Login Amazon Cognito setup guide

> This is provided as a reference only and doesn't represent production-ready code. It has not been thoroughly tested and should be used as a guide only.

## Overview

 Applications that use Amazon Cognito for authentication can be configured to use GOV.UK One Login as an external provider.

 This guide shows the setup steps required to get Amazon Cognito working with GOV.UK One Login.

## Known issues

- due to security restrictions, Amazon Cognito is only approved for use in production with authentication-only client applications
- when integrating with external OpenID Connect identity providers, Amazon Cognito does not support:
  - `private_key_jwt` token authentication
  - `nonce` parameter used to mitigate authorization code injection attacks
  - custom parameters such as `vtr` used to change default [authentication level](https://docs.sign-in.service.gov.uk/before-integrating/choose-the-level-of-authentication/#choose-the-level-of-authentication-for-your-service)

You'll need to contact GOV.UK One Login support to enable the options required for Amazon Cognito to work with GOV.UK One Login. You cannot enable these using the [GOV.UK One Login admin tool](https://admin.sign-in.service.gov.uk).

## Before you start

1. You must [register a client on GOV.UK One Login](https://docs.sign-in.service.gov.uk/before-integrating/set-up-your-service-s-configuration/#register-your-service-to-use-gov-uk-one-login). You can [use the GOV.UK One Login admin tool](https://admin.sign-in.service.gov.uk/register/enter-email-address) to create a client to test with in our integration environment. Registering to use this service requires a government email address.
1. [Contact GOV.UK One Login support](https://docs.sign-in.service.gov.uk/support/) to enable Amazon Cognito support.
1. Create a [client secret and hash](https://docs.sign-in.service.gov.uk/before-integrating/integrating-third-party-platform/#set-up-client-secret-using-client-secret-post)

## Configuring Amazon Cognito

If you already have an Amazon Cognito instance and existing user pool go to step 2.

### Step 1. Create a user pool

1. Using the AWS Console navigate to Amazon Cognito settings and enable the service.
1. Select **User pools**.
1. Select **Create user pool**.
1. Select the appropriate Application type - if you are using the Node.js example application, select **Traditional web application**.
1. Enter a value in **Name your application** e.g. My App.
1. In the **Configure** options - Options for sign-in identifiers, select **Email**.
1. Select **Create** and take note of the name of the user pool that is created. A random name is generated. You may want to rename it later.
1. The next page shows some code samples and a quick setup guide. Scroll to the bottom and select **Go to overview**.

### Step 2. Add an OpenID Connect identity provider

1. Select **User pools**.
1. Select the name of the user pool you created earlier.
1. Select **Authentication, Social and external providers**.
1. Select **Add identity provider**.
1. Select **OpenID Connect (OIDC)**.
1. Enter OneLogin in **Provider name**.
1. Enter your Client ID assigned by the GOV.UK One Login Admin tool.
1. Enter your client secret created previously.
1. Enter the scopes you are requesting: `openid` is mandatory, `email` and `phone` are both optional.
1. Set Attribute request method to `GET`.
1. In the Retrieve OIDC endpoints - Setup options select Manual input. Enter the following:
    1. Issuer URL - `https://oidc.integration.account.gov.uk/`
    1. Authorization endpoint - `https://oidc.integration.account.gov.uk/authorize`
    1. Token endpoint - `https://oidc.integration.account.gov.uk/token`
    1. Userinfo endpoint - `https://oidc.integration.account.gov.uk/userinfo`
    1. Jwks_uri endpoint - `https://oidc.integration.account.gov.uk/.well-known/jwks.json`
1. In Map attributes between your OpenID Connect provider and your user pool enter the following:
    1. User pool attribute: `email`, OpenID Connect attribute: `email`
    1. User pool attribute: `email_verified`, OpenID Connect attribute: `email_verified`
    1. User pool attribute: `phone_number`, OpenID Connect attribute: `phone_number`
    1. User pool attribute: `phone_number_verified`, OpenID Connect attribute: `phone_number_verified`
    1. User pool attribute: `username`, OpenID Connect attribute: `sub`
1. Select **Add identity provider**.

### Step 3. Setup the available authentication methods and callback URL

1. Select **User pools**
1. Select the name of the user pool you created earlier.
1. Select **Applications, App clients**, select the name of the application you created when creating the user pool in step 1.
1. Near the **Quick setup guide section** select **Login pages**.
1. In **Managed login pages configuration** select **Edit**.
1. In **Allowed callback URLs** enter your callback (also known as redirect URL). If you are using the Node.js example application enter `http://localhost:8080/oidc/authorization-code/callback`.
1. In **Identity providers** select **OneLogin**. You can optionally remove the Cognito user pool option depending on your requirements.
1. In **OAuth 2.0 grant types** make sure **Authorization code grant** is selected.
1. Select **Save changes**.
1. In **App client: My app** (or the name you used in step 1), copy the Client ID and Client secret values – you'll need then in the next step.

### Step 4. Configure your service using the Admin tool

1. In the Amazon Cognito console select **User pools**.
1. Select the name of the user pool you created earlier.
1. Copy the User pool ID.
1. Login to the [GOV.UK One Login admin tool](https://admin.sign-in.service.gov.uk/).
1. On the **Your services page** select the service you are integrating.
1. In **Manage client, Redirect URIs** enter: `https://USER_POOL_ID.auth.REGION.amazoncognito.com/oauth2/idpresponse` e.g if your user pool is in `eu-west-2` and is called `eu-west-2_s1dE77xQs` enter: `https://eu-west-2_s1dE77xQs.auth.eu-west-2.amazoncognito.com/oauth2/idpresponse`.
1. In **Client Authentication, Authentication method** ensure `client_secret_post` is enabled.
1. In **Client Secret Hash** select **Change**.
1. Enter your client secret hash value and select **Confirm**.

### Step 5. Configure your application

The following steps will be different if you are not using the Node.js example application.

1. Make a copy of the environmental configuration file `.env.cognito.example` and rename it to `.env.cognito`.
1. Open the `.env.cognito` file and update `OIDC_ISSUER` using the value for User pool ID copied at the start of step 4.
1. Update the `OIDC_CLIENT_ID` and `OIDC_CLIENT_SECRET` to the values copied at the end of step 4.
1. Save the file.
1. Open a terminal, make sure you are in the `onboarding-examples/clients/nodejs` and type `npm run dev:cognito folder`.
