# Custom policy for Azure Active Directory B2C to integrate with GOV.UK One Login

Read more about creating custom policies here https://learn.microsoft.com/en-us/azure/active-directory-b2c/custom-policies-series-overview

In places the policy references values using the `{Settings:...}` syntax that must be replace before the custom policy is uploaded to Azure AD B2C. You can do this manually or use the *B2C Policy Build* feature if you are using the VSCode extension.

## VSCode Extension

You might find it helpful to use Visual Studio Code with the Azure AD B2C extension to edit the custom policies. The extension provides syntax highlighting and intellisense for the XML files.\
https://marketplace.visualstudio.com/items?itemName=AzureADB2CTools.aadb2c