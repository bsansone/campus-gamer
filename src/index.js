import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./App.css";
import App from "./App";
import { SkipNavLink } from "@reach/skip-nav";
import * as serviceWorker from "./serviceWorker";
import { AppProvider } from "./store";
import { firebase, firebaseAuth } from "./firebase";
import { LocationProvider } from "@reach/router";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";
import "@reach/skip-nav/styles.css";
import "react-widgets/dist/css/react-widgets.css";
import "@reach/combobox/styles.css";

moment.locale("en");
momentLocalizer();

firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

ReactDOM.render(
  <LocationProvider>
    <AppProvider>
      <ThemeProvider>
        <CSSReset />
        <SkipNavLink />
        <App />
      </ThemeProvider>
    </AppProvider>
  </LocationProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
