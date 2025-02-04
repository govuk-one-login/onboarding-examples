# GOV.UK One Login Amazon Cognito setup guide

> This is provided as a reference only and doesn't represent production ready code. It has not been thoroughly tested and should be used as a guide only.

## Overview

 Applications that use Amazon Cognito for authentication can be configured to use GOV.UK One Login as an external provider.

 This guide shows the setup steps required to get Amazone Cognito working with GOV.UK One Login.

## Features

- due to security restrictions Amazon Cognito can only be used in production for authentication only client applications
- the integration requires the use of 2 client setup options: 

1. `client_secret_post` authentication method
1. `permit_missing_nonce` option enabled

## Before you start

You must [register a client on GOV.UK One Login](https://docs.sign-in.service.gov.uk/before-integrating/set-up-your-service-s-configuration/#register-your-service-to-use-gov-uk-one-login). You can [use the admin tool](https://admin.sign-in.service.gov.uk/register/enter-email-address) to create a client to test with in our integration environment. Registering to use this service requires a gov.uk email address.

## Configuring Amazon Cognito

If you already have a Cognito instance an existing suer pool 
### 1. Create a user pool

Navigate to the Amazon Cognito section in the AWS Console

### 2. Do something else

...

### 5. Test the integration

- browse to Settings - Identity - Auth. providers
- click OneLogin
- copy the Test-Only Initialization URL
- navigate to the URL in a new browser tab
- the browser will be redirected to GOV.UK One Login to complete the authentication flow
- when returned to Salesforce you will see the data retrieved from GOV.UK One Login in XML format
