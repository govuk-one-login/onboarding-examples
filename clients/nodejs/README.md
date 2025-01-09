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

Works with the:

|Environment|Description|
|-----------|-----------|
|[GOV.UK One Login Simulator](https://github.com/govuk-one-login/simulator)| A development and testing tool that simulates GOV.UK One Login. It is preconfigured to allow authentication and identity journeys by default and may be configured to suit your testing needs.|
|[GOV.UK One Login integration environment](https://docs.sign-in.service.gov.uk/before-integrating/register-and-manage-your-service/)| A non-production environment for use when developing and testing an integration with GOV.UK One Login. Use the [GOV.UK One Login admin tool](https://admin.sign-in.service.gov.uk/register/enter-email-address) to create a client configuration then configure the Client ID and Public Key in the  `.env.integration` configuration file.|

## Get the example source code

```bash
git clone https://github.com/govuk-one-login/onboarding-examples
cd onboarding-examples/clients/nodejs
```

## How to run the example and simulator
Two ways to run the example and simulator locally:
- Docker compose
- Node.js using source source with the simulator running in Docker

### Run the example and simulator in containers using Docker compose

This is the quickest method if you want to quickly see the data returned.

```bash
docker compose up 
```


### Run the example from source with Node.js and the simulator in a Docker container

This is the best method if you want to run the example in Node.js and inspect the source code in your IDE.

#### 1. Start the simulator

Run the simulator locally

```bash
npm run simulator:start 
```

Check the simulator is started on port 3000

```bash
npm run simulator:config
```

#### 2. Build the example

Resolve dependencies and build the app

```bash
nvm install 22.11.0 && nvm use 22.11.0
npm ci && npm npm run build
```

#### 3. Run the example

Start the example

```bash
npm run dev:sim
```

## How to test the example

1. browse to [http://localhost:8080](http://localhost:8080)
1. press the "Make a request for authentication" button and review the returned data
1. press the "Make a request for authentication and identity" button to check identity and review the returned data 
1. click the "Sign out" link in the service header