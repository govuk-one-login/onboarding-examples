# Typescript tool to simulate the face to face (F2F) check return process

A simple relying party implementation that simulates the face to face (F2F) check return process.  

This tool can be used to test the implementation of your "landing page". There is more guidance about [creating a landing page](https://docs.sign-in.service.gov.uk/LINK).

```mermaid

flowchart LR
    A[Email] --> B[F2F test tool]
    B --> | 1 authenticate | C[GOV.UK One Login Integration]
    C --> | 2 callback | B
    B <--> | 3 token request | C
    B --> | 4 redirect | D[RP F2F Landing Page]
    D --> | 5 authenticate | C
    C --> | 6 callback | D
    D <--> | 7 token request | C
    D --> | 8 userinfo | C
    D --> E[Post office return]

```

## Usage

### 1. Configuration

Most of the configuration is the same as a the example application (see the Quickstart ["Run the example service using the GOV.UK One Login integration environment"](https://docs.sign-in.service.gov.uk/quick-start/#run-the-example-service-using-the-gov-uk-one-login-integration-environment)). Follow the instructions to configure the example with the integration environment to run that example relying party locally on port `8080`. This example hosts an example landing page at http://localhost:8080/landing-page.

In the `f2f-test` directory configure the `.env` file as follows:
- duplicate the example configuration with `cp .env.example .env`
- set `OIDC_CLIENT_ID` to the client ID
- set `OIDC_PRIVATE_KEY` to the private key (without headers and linefeeds, all on one line)
- set `F2F_LANDING_PAGE_URL` to `http://localhost:8080/landing-page`, the URL you want the user redirected to after clicking the link in the post office return email and successfully authenticating.

### 2.1 Start the F2F tool with Typescript

```bash
npm install
npm run build
npm run start
```

### 2.2 Start the F2F tool with Docker Compose

`docker compose up --build`

### 3. Start the journey

Once the example is running, assuming you are running on the default port and localhost make a request as shown below:

`http://localhost:8083`

You will be redirected to an example email to start the test process. Click on the link in the email and you will be lead through the process.



## How it works



```mermaid

sequenceDiagram
    participant E as Email
    participant F as F2F test tool    
    participant R as Relying Party
    participant O as GOV.UK One Login
    E->>F: 1. Login request
    F->>O: 2. /authorize
    O->>O: 3. User authenticates
    O->>F: 4. callback
    F->>O: 5. /token
    O->>F: 6. tokens
    F->>R: 7. redirect to F2F landing page
    R->>O: 8. /authorize
    O->>O: 9. User has existing One Login session
    O->>R: 10. callback
    R->>O: 11. /token
    O->>R: 12. tokens
    R->>O: 13. /userinfo - sub, email, phone
    R->>R: 14. Show Post office return screen
    R->>O: 15. /authorize
    O->>O: 16. Retrieve existing identity
    O->>R: 17. callback
    R->>O: 18. /token
    O->>R: 19. tokens
    R->>O: 20. /userinfo - coreIdentityJWT, address

```

1. User clicks link to F2F test tool in email
1. User is redirected to GOV.UK One Login to authenticate
1. User signs in to their existing account
1. /token
1. returns tokens
1. User is redirected to F2F test tool
1. User is redirected to the RP's F2F landing page
1. User is redirected to GOV.UK One Login to authenticate
1. the user does not need to sign because they have an existing GOV.UK One Login session
1. User is redirected to RP's redirect URL
1. /token
1. return tokens
1. RP requests userinfo data: `email`, `phone` and `sub`
1. RP shows user the Post Office return screen
1. User clicks Request identity check result
1. User is redirected to GOV.UK One Login for identity verification
1. User is shown identity reuse screen
1. User is redirected to RP's redirect URL
1. /token
1. return tokens
1. RP requests userinfo data: `coreidentityJWT` and `address` etc
