# Generate a Time-based one-time password (TOTP) in TypeScript

A simple command line example that generates a [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) code in TypeScript in accordance with IETF [rfc6238](https://datatracker.ietf.org/doc/html/rfc6238)

## Usage
```
totp.ts

NAME
    totp.ts - generate a TOTP code

SYNOPSIS
    totp.ts SECRET
    
DESCRIPTION
    totp.ts generates a TOTP code using the provided SECRET

EXAMPLES
    totp.ts Y3BUOUHH4CB7JQNQGYRSTUC5PAHYRJAJ
```

## Get the secret key for the authentication app
You need to supply the tool with a secret key to generate the one time codes. 

Follow the GOV.UK One Login journey to register. 

![](images/mfa01.png)

Select "Authenticator app" from the dropdown menu.

![](images/mfa02.png)

Copy the secret key (in this example it is `Y3BU OUHH 4CB7 JQNQ GYRS TUC5 PAHY RJAJ`) and pass it as a parameter to the command line tool `totp.ts`

## Run locally

The code in the command below must be what you copied without spaces. You can run the command

```
nvm install 22.11.0 && nvm use 22.11.0 && npm install
npx ts-node ./totp.ts Y3BUOUHH4CB7JQNQGYRSTUC5PAHYRJAJ
```

You will get a code on the console.

This code can be used to continue using the 6 digit **Security code**