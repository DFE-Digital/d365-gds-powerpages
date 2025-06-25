# Dynamics 365 CRM - GDS Power Pages Setup

These instructions guide you through setting up your custom Power Pages website. 

You will choose between the DfE and GOV.UK versions based on your branding standards, set up an app registration in the Azure Portal, configure permissions in Dynamics 365, run a GitHub action, and re-activate the website in Power Pages.

## Before starting, ensure you have the following permissions:

- Access to the Azure Portal with permissions to create app registrations in the Department for Education directory.
- System Administrator role in the Dynamics 365 environment.
- Permissions to run workflows in the GitHub repository.

## Set up App Registration in Azure Portal
You need to create an app registration in the Azure Portal to allow the GitHub action to interact with your Dynamics 365 environment.

Sign in to the Azure Portal (opens in a new tab) using your Department for Education credentials and ensure you are in the Department for Education directory.
In the search bar at the top of the screen, search for App registrations and click New registration.
Enter a name for the app (e.g. "[Your Service] Power Pages Setup App"), select "Accounts in this organizational directory only," and click Register.
In the app registration, go to API permissions > Add a permission > Dynamics CRM.
Select Delegated permissions, check user_impersonation, and click Add permissions.
Go to Certificates & secrets > New client secret. Provide a description (e.g., "GitHub Action Secret"), set an expiration date, and click Add. Copy the secret value immediately.
The client secret will be hidden after you navigate away, so copy it now and store it securely.
Add App Registration as a User in Dynamics 365
Add the app registration as an application user in your Dynamics 365 environment and grant it system admin permissions.

Sign in to the Power Platform Admin Center (opens in a new tab).
Navigate to Manage > Environments, then select your Dynamics 365 environment.
Go to Settings > Users + permissions > Application users > New app user.
Select Add an app and enter the app's client ID in the search bar (found in Azure Portal under "Overview").
Select the app and click Add.
Complete the remaining details:
Business unit: Usually the default business unit and can often be found and selected by entering a vowel to trigger the search dropdown.
Security role: Assign the System Administrator permission to the app
Click Create.
Run the appropriate GitHub Action
Choose the DFE or GOVUK version based on your branding standards and run the corresponding "Create" action in GitHub.

Go to the repository https://github.com/DFE-Digital/d365-gds-powerpages (opens in a new tab).
Navigate to the Actions tab.
Select the workflow for your chosen version:
Create DFE Portal for Department for Education branding.
Create GOVUK Portal for GOV.UK branding.
Click Run workflow.
Fill in the required fields:
Azure AD Client ID for target environment: Enter the app's client ID from Azure Portal.
Azure AD Client Secret for target environment: Enter the client secret you copied.
Environment URL for the target environment: Enter your Dynamics 365 environment URL (e.g. https://your-env.crm4.dynamics.com).
Click Run workflow and wait for the action to complete successfully (indicated by a green checkmark).
If the workflow fails, check the error logs in the GitHub Actions interface and ensure all inputs are correct and the app registration is properly configured.
Re-activate the website in Power Pages
After the GitHub action completes, re-activate your website in Power Pages to make it live.

Sign in to Power Pages (opens in a new tab).
Select the environment where the portal was created (matching the Dynamics 365 environment URL used in Step 3).
Go to Inactive sites and locate your portal site (e.g. "DfE Portal" or "GOVUK Portal").
Click Activate.
Your custom Power Pages website should now be set up and live. Verify it by visiting the site URL provided in Power Pages once the activation is complete.
