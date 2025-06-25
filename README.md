# Dynamics 365 CRM - GDS Power Pages Setup

These instructions guide you through setting up your custom Power Pages website. 

You will choose between the DfE and GOV.UK versions based on your branding standards, set up an app registration in the Azure Portal, configure permissions in Dynamics 365, run a GitHub action, and re-activate the website in Power Pages.

### Before starting, ensure you have:

- access to the Azure Portal with permissions to create app registrations in the **Department for Education** directory.
- System Administrator role in the Dynamics 365 environment.
- permissions to run workflows in the GitHub repository.
- completed the pre-requisite steps detailed in the [Dynamics 365 Design Manual](https://d365-design-manual-8523de7fad90.herokuapp.com/powerpages/getting-started/pre-requisites/)

## Set up App Registration in Azure Portal
You need to create an app registration in the Azure Portal to allow the GitHub action to interact with your Dynamics 365 environment.

1. Sign in to the [Azure Portal](https://portal.azure.com/) using your Department for Education credentials and ensure you are in the *Department for Education* directory.
2. In the search bar at the top of the screen, search for *App registrations* and click *New registration*.
3. Enter a name for the app (e.g. "[Your Service] Power Pages Setup App"), select *Accounts in this organizational directory only* and click *Register*.
4. In the app registration, go to *API permissions > Add a permission > Dynamics CRM*.
5. Select *Delegated permissions*, check *user_impersonation*, and click *Add permissions*.
6. Go to *Certificates & secrets > New client secret*. Provide a description (e.g., "GitHub Action Secret"), set an expiration date, and click *Add*. Copy the secret value immediately.
> **The client secret will be hidden after you navigate away, so copy it now and store it securely.**

## Add App Registration as a User in Dynamics 365
Add the app registration as an application user in your Dynamics 365 environment and grant it system admin permissions.

1. Sign in to the [Power Platform Admin Center](https://admin.powerplatform.microsoft.com/).
2. Navigate to *Manage > Environments*, then select your Dynamics 365 environment.
3. Go to *Settings > Users + permissions > Application users > New app user*.
4. Select *Add an app user* and enter the app's client ID in the search bar (found in Azure Portal under "Overview").
5. Select the app and click *Add*.
6. Complete the remaining details:
    1. Business unit: Usually the default business unit and can often be found and selected by entering a vowel to trigger the search dropdown.
    2. Security role: Assign the *System Administrator* permission to the app
7. Click *Create*.

## Run the appropriate GitHub Action
Choose the DfE or GOVUK version based on your branding standards and run the corresponding *Create [DfE or GOVUK] Website* action in GitHub.

1. Go to the repository [https://github.com/DFE-Digital/d365-gds-powerpages](https://github.com/DFE-Digital/d365-gds-powerpages).
2. Navigate to the *Actions* tab.
3. Select the workflow for your chosen version:
    1. *Create Dfe Website* for Department for Education branding.
    2. *Create GOVUK Website* for GOV.UK branding.
4. Click *Run workflow*.
5. Fill in the required fields:
    1. Azure AD Client ID for target environment: Enter the app's Client ID from Azure Portal.
    2. Azure AD Client Secret for target environment: Enter the Client Secret you copied.
    3. Environment URL for the target environment: Enter your Dynamics 365 environment URL (e.g. https://your-env.crm4.dynamics.com).
6. Click *Run workflow* and wait for the action to complete successfully (indicated by a green checkmark).
> **If the workflow fails, check the error logs in the GitHub Actions interface and ensure all inputs are correct and the app registration is properly configured.**

## Re-activate the website in Power Pages
After the GitHub action completes, re-activate your website in Power Pages to make it live.

1. Sign in to [Power Pages](https://make.powerpages.microsoft.com/).
2. Select the environment where you imported the website.
3. Go to *Inactive Sites* and locate your website site (e.g. "DfE Power Pages Core" or "GOVUK Power Pages Core").
4. Click *Activate*.
5. Follow the steps to complete your website setup.

Your custom Power Pages website should now be set up and live. Verify it by visiting the site URL you specified during the final stages of the setup in Power Pages once the activation is complete.
