NodeJS Yoti App Integration
===========================

1) [An Architectural View](#an-architectural-view) -
High level overview of integration

1) [Client Initialisation](#client-initialisation) -
Description on initialising the client

1) [Profile Retrieval](#profile-retrieval) -
Description on setting up profile

1) [Handling Users](#handling-users) -
Description on handling user details

1) [Running the Example](#running-the-example)
How to run the example project provided

1) [API Coverage](#api-coverage) -
Attributes defined

## An Architectural View

To integrate your application with Yoti, your back-end must expose a GET endpoint that Yoti will use to forward tokens.
The endpoint can be configured in Yoti Hub when you create/update your application.

The image below shows how your application back-end and Yoti integrate in the context of a Login flow.
Yoti SDK carries out for you steps 6, 7 ,8 and the profile decryption in step 9.

![alt text](login_flow.png "Login flow")

Yoti also allows you to enable user details verification from your mobile app by means of the [Android](https://github.com/getyoti/android-sdk-button) and [iOS](https://github.com/getyoti/ios-sdk-button) SDKs. In that scenario, your Yoti-enabled mobile app is playing both the role of the browser and the Yoti app. By the way, your back-end doesn't need to handle these cases in a significantly different way. You might just decide to handle the `User-Agent` header in order to provide different responses for web and mobile clients.

## Client Initialisation

The YotiClient is the SDK entry point. To initialise it you need to include the following snippet inside your endpoint initialisation section:

```javascript
const yoti = require('yoti');
const fs = require('fs');
const CLIENT_SDK_ID = 'YOUR_SDK_ID';
const PEM = fs.readFileSync('path/to/your-application-pem-file.pem');
const yotiClient = new yoti.Client(CLIENT_SDK_ID, PEM);
```

## Profile Retrieval

When your application receives a token via the exposed endpoint (it will be assigned to a query string parameter named `token`), you can easily retrieve the user profile by adding the following to your endpoint handler:

```javascript

yotiClient.getActivityDetails(token).then((activityDetails) => {
    //handle response here
})

```

Before you inspect the user profile, you might want to check whether the user validation was successful.
This is done as follows:

```javascript
yotiClient.getActivityDetails(token).then((activityDetails) => {
    if(activityDetails.getOutcome() == 'SUCCESS') {
        const profile = activityDetails.getProfile();
    } else {
        // handle unhappy path
    }
})
```

### Programmatic QR code creation

Dynamic Policy generation is a way of requesting non-static attribute lists for your application.

This is useful when you want or need different permutations of attributes from Yoti, without having to create a new scenario.

E.g:

* Request 1: full-name and date-of-birth
* Request 2: full-name and address

This service will query Yoti for a QR Code/link associated with the requested attribute list.

This QR Code/link should then be embedded into your page using the Yoti widget to begin a share with Yoti.

#### Example

The following example demonstrates how a Dynamic Policy can be built using attribute methods such as `withFullName()`, and generic method `withWantedAttribute()`.

```javascript
const wantedEmailAttribute = new yoti.WantedAttributeBuilder()
  .withName('email_address')
  .withAcceptSelfAsserted()
  .build();

const dynamicPolicy = new yoti.DynamicPolicyBuilder()
  .withFullName()
  .withWantedAttribute(wantedEmailAttribute)
  .build();

const dynamicScenario = new yoti.DynamicScenarioBuilder()
  .withCallbackEndpoint('/profile')
  .withPolicy(dynamicPolicy)
  .build();

yotiClient.createShareUrl(dynamicScenario)
  .then((shareUrlResult) => {
    const shareUrl = shareUrlResult.getShareUrl();
    const refId = shareUrlResult.getRefId();
  });

```

## Handling Users

When you retrieve the user profile, you receive a user ID generated by Yoti exclusively for your application.
This means that if the same individual logs into another app, Yoti will assign her/him a different ID.
You can use this ID to verify whether (for your application) the retrieved profile identifies a new or an existing user.
Here is an example of how this works:

```javascript
yotiClient.getActivityDetails(token).then((activityDetails) => {
    if(activityDetails.getOutcome() == 'SUCCESS') {
        const userProfile = activityDetails.getUserProfile(); // deprecated
        const profile = activityDetails.getProfile();
        const user = yourUserSearchFunction(activityDetails.getRememberMeId());
        if(user) {
            // handle login
        } else {
            // handle registration
            const givenNames = profile.getGivenNames().getValue();
            const familyName = profile.getFamilyName().getValue();
        }
    } else {
        // handle unhappy path
    }
})
```

Where `yourUserSearchFunction` is a piece of logic in your app that is supposed to find a user, given a _Remember Me ID_.
No matter if the user is a new or an existing one, Yoti will always provide her/his profile, so you don't necessarily need to store it.

The `profile` object provides a set of attributes corresponding to user attributes. Whether the attributes are present or not depends on the settings you have applied to your app on Yoti Hub.

You can retrieve the sources and verifiers for each attribute as follows:

```javascript
const givenNamesSources = givenNames.getSources(); // list/array of anchors
const givenNamesVerifiers = givenNames.getVerifiers(); // list/array of anchors
const givenNamesAnchors = givenNames.getAnchors(); // list/array of anchors
```

You can also retrieve further properties from these respective anchors in the following way:

```javascript
// Retrieving properties of the first anchor
const type = givenNamesSources[0].getType(); // string
const value = givenNamesSources[0].getValue(); // string
const subtype = givenNamesSources[0].getSubType(); // string
const timestamp = givenNamesSources[0].getSignedTimeStamp().getTimestamp(); // Date object
const originServerCerts = givenNamesSources[0].getOriginServerCerts(); // list of X509 certificates
```

## Running the Example

- See the [Profile Example](../examples/profile/README.md) folder for instructions on how to run the Profile Example project

## API Coverage

* Activity Details
  * [X] Remember Me ID `getRememberMeId()`
  * [X] Parent Remember Me ID `getParentRememberMeId()`
  * [X] Receipt ID `getReceiptId()`
  * [X] Timestamp `getTimestamp()`
  * [X] Base64 Selfie Uri `getBase64SelfieUri()`
  * [X] Profile `getProfile()`
    * [X] Full Name `getFullName().getValue()`
    * [X] Given Names `getGivenNames().getValue()`
    * [X] Family Name `getFamilyName().getValue()`
    * [X] Age / Date of Birth `getDateOfBirth().getValue()`
    * [X] Age / Verify Condition `getAgeVerified().getValue()`
    * [X] Gender `getGender().getValue()`
    * [X] Nationality `getNationality().getValue()`
    * [X] Mobile Number `getPhoneNumber().getValue()`
    * [X] Photo `getSelfie().getValue()`
    * [X] Email Address `getEmailAddress().getValue()`
    * [X] Address `getPostalAddress().getValue()`
    * [X] Structured Address `getStructuredPostalAddress().getValue()`
    * [X] Document Details `getDocumentDetails().getValue()`
  * [X] ApplicationProfile `.getApplicationProfile()`
    * [X] Name `getName().getValue()`
    * [X] URL `getUrl().getValue()`
    * [X] Logo `getLogo().getValue()`
    * [X] Receipt Background Color `getReceiptBgColor().getValue()`