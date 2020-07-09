# CAMPUS GAMING NETWORK

Connect with other collegiate gamers for casual or competitive gaming at your school or nearby.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing pirposes.

## Prerequisites

The project uses nodejs which can be downloaded here:

- [nodejs](https://nodejs.org/en/download/)

## Clone

- Clone this repo to you local machine using:

  https://github.com/bsansone/campus-gaming-network.git

## Setup

Once you have the project on your local machine, open up a terminal in the project folder and run,

```shell
$ npm install
```

to download and install the dependencies.

### Firebase

A Firebase project must be created to fully test and run the app. You can sign up using your google account here:

https://firebase.google.com/

Create a project and call it `campus-gaming-network-test` or something along those lines. You will need to initialize a new database as well as enable the `Email/Password` authentication method. You can view the Firebase documentation here:

https://firebase.google.com/docs

To register the app to your firebase account you must:

1. Copy the contents of `.env.sample` into a new file called `.env.local`

2. Populate the firebase section of that `.env.local` file with your unique Firebase SDK snippet found under your firebase project settings.

```javascript
const firebaseConfig = {
  apiKey: 'some-text',
  authDomain: 'some-text',
  databaseURL: 'some-url',
  projectId: 'some-text',
  storageBucket: 'some-text',
  messagingSenderId: 'some-text',
  appId: 'some-text',
};
```

```
REACT_APP_FIREBASE_API_KEY=xxxxXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxxXXXX.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://xxxXXXX.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=xxxxXXXX
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxxXXXX.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxxXXXX
REACT_APP_FIREBASE_APP_ID=xxxxXXXX:xxxxXXXX:xxxxXXXX:xxxxXXXX
```

3. To upload the cloud functions into you firebase project run,

```shell
$ firebase deploy
```

4. To upload the schools info into the db, navigate to the `uploadSchools` folder in the app directory and run,

```shell
$ npm install
```

- this will create a `node_modules` folder and install the dependencies needed.

- once you have the dependencies you can run the script to upload the schools by typing into the terminal,

```shell
$ node .
```

- you should now see a `schools` collection was created and populated with several school documents in your firebase project.

### Google Maps API

To get the Google Maps API Key, follow the steps indicated here

[Google Maps Platform](https://developers.google.com/maps/documentation/javascript/get-api-key)

Copy the api key into the `.env.local` file that was created earlier

## Running

To run the app and test functionality use,

```shell
$ npm start
```
