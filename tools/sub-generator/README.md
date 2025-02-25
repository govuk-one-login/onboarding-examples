# Generate a Time-based one-time password (TOTP) in TypeScript

A simple example that creates an API endpoint that generates a [`sub`](https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/authenticate-your-user/#receive-response-for-retrieve-user-information) in the same format that GOV.UK One Login uses in tokens, and userinfo responses..

## Usage

```bash
npm install
npm run build
npm run start
```

Once the example is running, assuming you are running on the default port and localhost make a request as shown below:

```bash

http://localhost:8082/sub-generator?id=1234567890&sector=https://something.gov.uk

```

## This example can also be run in Docker

`docker compose up --build`
