> [!WARNING]
> This is intended as a example and is not production quality code.

# Example GOV.UK One Login Relying Party in Typescript

An example Node.js TypeScript application using GOV.UK One Login to authenticate users for use with the [GOV.UK One Login integration environment](https://docs.sign-in.service.gov.uk/before-integrating/register-and-manage-your-service/) and the [GOV.UK One Login Simulator](https://github.com/govuk-one-login/simulator).

It is preconfigured to work with a local instance of the GOV.UK One Login Simulator. It can be configured to work with the integration environmnent by configuring a client using the [self service admin tool](https://admin.sign-in.service.gov.uk/register/enter-email-address) and updating the `.env`. 

```
git clone https://github.com/govuk-one-login/rp-reference
cd rp-reference/clients/nodejs
npm install
npm run build
npm run dev
open http://localhost:8080
```

