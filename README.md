# GOV.UK One Login examples

> [!WARNING]
> These example applications and data are provided for demonstration purposes only and are not production quality code with appropriate levels of error handling.
A number of example relying party [clients](clients) and [data](data)


## Clients 

See the application specific README files for guidance on how to get these samples up and running.

|Runtime|Version|Language|Description|Usage|
|-------|-|--------|-----------|-----|
| Node.js | 22.11.0 | [Typescript](https://www.typescriptlang.org/) | Typescript using the express framework| [README](clients/nodejs/README.md) |
| Salesforce | | [Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dev_guide.htm) | Apex using the Salesforce framework |  [README](clients/salesforce-apex/README.md) |
+| Amazon Cognito | | [Configuration](clients/amazon-cognito/README.md) | Amazon Cognito setup guide | [README](clients/amazon-cognito/README.md) |

For up-to-date technical documentation detailing how to integrate with GOV.UK One Login see the [technical documentation](https://docs.sign-in.service.gov.uk/).

## Data
Read more about the data provided in the [README](data/README.md)
Examples of:
- [addresses](data/addresses)
- [names](data/names)
- [identities](data/identities)
- [configuration files](data/simulator-configuration) for the GOV.UK One Login Simulator

## Tools
- [Generate a Time-based one-time password (TOTP) in TypeScript](tools/totp)
- [Face-to-face identity verification test tool](tools/f2f-test)
