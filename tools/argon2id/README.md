# Generate an ARGON2ID hash

Clients using `client_secret_post` must [send the Onboarding team an ARGON2ID encoded hash](https://docs.sign-in.service.gov.uk/before-integrating/integrating-third-party-platform/#hash-your-client-secret) of their secret and hash.

This tool generates the required hash in Typescript.

## Prerequisites

- Install Node.js
- `nvm install 20.11.0 && nvm use 20.11.0`
- `npm ci`

## Build the code
- `npm run build`

## Run the code using Typescript
`npx ts-node generate-argon2id.ts 'PLAINTEXT SECRET' 'THIS IS A SALT'`

## Run the code using the transpiled javascript
`npx node generate-argon2id.js 'PLAINTEXT SECRET' 'THIS IS A SALT'`

## Build and run a docker image
```
docker build -t generate-argon2id .
```

```
docker run --rm -ti generate-argon2id 'PLAINTEXT SECRET' 'THIS IS A SALT'
```
## Make a bash alias
```
alias generate-argon2id="docker run --rm -ti argon2id"
```

```
generate-argon2id 'PLAINTEXT SECRET' 'THIS IS A SALT'
```