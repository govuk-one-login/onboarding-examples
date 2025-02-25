# Generate a key pair or client secret and hash

A simple example that [creates a key pair](https://docs.sign-in.service.gov.uk/before-integrating/set-up-your-public-and-private-keys/#create-a-key-pair) using Node.js crypto functionality in TypeScript

## Usage

Simply install the dependencies then run the example.

```bash
npm install

npm run start
```

The example generates 4 files.

1. public_key.pem
1. private_key.pem
1. client_secret.txt
1. client_secret_hash.txt

Depending on the token authentication method your service uses you will need either the public and private key files ot the client secret and client secret hash files.
