# Example GOV.UK One Login relying party client using Node.js and Typescript

> [!WARNING]
> This is intended as a example and is not production quality code.

An example [Node.js](https://nodejs.org/) [TypeScript](https://www.typescriptlang.org/) application using GOV.UK One Login to authentication and identity.

The example demonstrates:

- configuration using the discovery metadata endpoint and a local environment variables
- authentication request
- identity verification request
- coreIdentityJWT validation using a public key retrieved from the DID endpoint
- logout request
- use of JWT Authorisation Request (JAR)

A quick start on how to get started is available [here](https://docs.sign-in.service.gov.uk/quick-start/) 

You have two choices for testing your service:
- Configure and test against `GOV.UK One Login integration environment`
- Configure and test against `GOV.UK One Login Simulator`


|Environment|Description|
|-----------|-----------|
|GOV.UK One Login integration environment| A non-production environment for use when developing and testing an integration with GOV.UK One Login. Use the [GOV.UK One Login admin tool](https://admin.sign-in.service.gov.uk/register/enter-email-address) to create a client configuration then configure the Client ID, Public Key, etc in the  `.env.integration` configuration file.|
|GOV.UK One Login Simulator| A development and testing tool that simulates GOV.UK One Login. It is preconfigured to allow authentication and identity journeys by default and may be configured to suit your testing needs. The source code for simulator is available [here](https://github.com/govuk-one-login/simulator) |

## Get the example source code

```bash
git clone https://github.com/govuk-one-login/onboarding-examples
cd onboarding-examples/clients/nodejs
```

## How to run the example using GOV.UK One Login Simulator

Tech docs on how to run and test using simulator are available [here](https://docs.sign-in.service.gov.uk/quick-start/#run-the-example-service-with-the-gov-uk-one-login-simulator-using-docker-compose)

## How to run the example using GOV.UK One Login integration environment

Tech docs on how to run and test using simulator are available [here](https://docs.sign-in.service.gov.uk/quick-start/#run-the-example-service-using-the-gov-uk-one-login-integration-environment)

> You can configure and test you service against . You will need the Client ID for production configuration against **GOV.UK One Login integration environment**


## Utlity helpers
There are some helper scripts you can use

#### 2. Generate Keys
Generating local keys

```bash
npm run generatekeys
```

If you want see the contents of the generated key , you can read with a text editor of your choice or use these utilities

```bash
npm run  showPrivateKey
npm run  showPublicKey
```

## Toubleshooting tips

### Key not working

Correct key settings in .env.integration file
> Ensure the `OIDC_PRIVATE_KEY` value is in quotes and strip **-----BEGIN PRIVATE KEY-----** and **-----END PRIVATE KEY-----**

> Double check the `Client ID` and the configuration matches the local .env.integration config and in **GOV.UK One Login integration environment**

## Pre-paring for production

Production config is seperate from  *GOV.UK One Login integration environment*

You will need the `Client ID` you have tested the integration against. 

Further docs configuring for production are available [here](https://docs.sign-in.service.gov.uk/configure-for-production/) 