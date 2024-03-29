# Salesforce DX Project: Coding Challenge

## Description

A repo containing my coding challenge results in SFDX format (also includes a package.xml for easier push/pull)

## Requirements/Dependencies

This solution requires that State/Country picklists are active and configured, per the following [article](https://help.salesforce.com/s/articleView?language=en_US&id=sf.admin_state_country_picklists_configure.htm&type=5).

For security, please assign the included Permission Set "Coding Challenge" to you user in order to have access to the solution; LWCs are available in the provided Lightning Page "Zip Code Coding Challenge"

For the Platform Events assignment, both Flows and Apex Triggers are included, however in code they are turned off to avoid interactions. Please either activate the flows or set the active flags in the Apex handler classes to true to enable either functionality.
