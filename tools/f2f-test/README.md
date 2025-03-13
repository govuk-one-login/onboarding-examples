# Generate a Time-based one-time password (TOTP) in TypeScript

A simple relgying party implementation that simulates the in person identity check retuyrn process.

This tool can be used to test the implementation of your "landing page". There is more guidance about [creating a landing page](LINK).

## Usage

```bash
npm install
npm run build
npm run start
```

Once the example is running, assuming you are running on the default port and localhost make a request as shown below:

```bash

http://localhost:8083

```

You will be redirected to an example email to start the test process. Click on the link in the email.

## Configuration

Most of the configuration is the same as a standard relying part, except `F2F_LANDING_PAGE_URL`.

F2F_LANDING_PAGE_URL should be the URL you want the user redirected to after clicking the link in the post office return email and successfully authenticating.

## This example can also be run in Docker

`docker compose up --build`
