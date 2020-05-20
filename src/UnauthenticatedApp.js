import React from "react";
import { Router } from "@reach/router";
import { firebaseAuth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Pages
import Home from "./pages";
import School from "./pages/school";
import User from "./pages/user";
import Event from "./pages/event";
import NotFound from "./pages/not-found";
import Signup from "./pages/signup";
import Login from "./pages/login";

// Components
import UnauthenticatedNav from "./components/UnauthenticatedNav";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import NavSilhouette from "./components/NavSilhouette";
import UserSilhouette from "./components/UserSilhouette";
import SchoolSilhouette from "./components/SchoolSilhouette";
import EventSilhouette from "./components/EventSilhouette";

const UnauthenticatedApp = () => {
  const [authenticatedUser, isAuthenticating] = useAuthState(firebaseAuth);
  const [isLoading, setIsLoading] = React.useState(true);
  const [nav, setNav] = React.useState(<NavSilhouette />);
  const [routes, setRoutes] = React.useState(<SilhouetteRoutes />);

  React.useEffect(() => {
    const _isLoading = isAuthenticating;

    if (isLoading !== _isLoading) {
      setIsLoading(_isLoading);
    }
  }, [authenticatedUser, isAuthenticating, isLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      setNav(<UnauthenticatedNav />);
      setRoutes(<Routes />);
    }
  }, [isLoading]);

  return (
    <React.Fragment>
      <Header>{nav}</Header>
      <main className="pb-12">{routes}</main>
    </React.Fragment>
  );
};

const SilhouetteRoutes = () => {
  return (
    <Router>
      <ScrollToTop default>
        <Home path="/" />
        <UserSilhouette path="user/:id" />
        <SchoolSilhouette path="school/:id" />
        <EventSilhouette path="event/:id" />
        <Signup path="register" />
        <Login path="login" />
        <NotFound default />
      </ScrollToTop>
    </Router>
  );
};

const Routes = () => {
  return (
    <Router>
      <ScrollToTop default>
        <Home path="/" />
        <User path="user/:id" />
        <School path="school/:id" />
        <Event path="event/:id" />
        <Signup path="register" />
        <Login path="login" />
        <NotFound default />
      </ScrollToTop>
    </Router>
  );
};

export default UnauthenticatedApp;
