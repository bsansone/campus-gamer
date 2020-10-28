// Libraries
import React from "react";
import { Router } from "@reach/router";
import { useAuthState } from "react-firebase-hooks/auth";
import isEmpty from "lodash.isempty";
import { Box } from "@chakra-ui/core";
import { Settings } from "luxon";

// Other
import { firebaseAuth } from "./firebase";
import { useAppState, useAppDispatch, ACTION_TYPES } from "./store";

// Hooks
import useFetchUserDetails from "hooks/useFetchUserDetails";
import useFetchSchoolDetails from "hooks/useFetchSchoolDetails";

// Pages
import Home from "pages";
import School from "pages/school";
import User from "pages/user";
import Event from "pages/event";
import EditUser from "pages/edit-user";
import EditSchool from "pages/edit-school";
import CreateEvent from "pages/create-event";
import AuthAction from "pages/auth-action";
import AboutUs from "pages/about-us";
import FrequentlyAskedQuestions from "pages/frequently-asked-questions";
import NotFound from "pages/not-found";

// Components
import AuthenticatedNav from "components/AuthenticatedNav";
import ScrollToTop from "components/ScrollToTop";
import NavSilhouette from "components/NavSilhouette";
import FormSilhouette from "components/FormSilhouette";
import UserSilhouette from "components/UserSilhouette";
import SchoolSilhouette from "components/SchoolSilhouette";
import EventSilhouette from "components/EventSilhouette";
import Empty from "components/Empty";
import Footer from "components/Footer";
import VerifyEmailReminderBanner from "components/VerifyEmailReminderBanner";

const AuthenticatedApp = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [authenticatedUser, isAuthenticating] = useAuthState(firebaseAuth);
  const [user, isFetchingUser] = useFetchUserDetails(
    authenticatedUser ? authenticatedUser.uid : null
  );
  const [school, isFetchingSchool] = useFetchSchoolDetails(
    user ? user.school.id : null
  );
  const isLoadingAuthenticatedUserData = React.useMemo(
    () => isEmpty(state.user) || isAuthenticating || isFetchingUser,
    [state.user, isAuthenticating, isFetchingUser]
  );
  const isLoadingAuthenticatedUserSchoolData = React.useMemo(
    () => isEmpty(state.school) || isAuthenticating || isFetchingSchool,
    [state.school, isAuthenticating, isFetchingSchool]
  );
  const shouldSetAuthenticatedUser = React.useMemo(
    () => !!user && isEmpty(state.user),
    [user, state.user]
  );
  const shouldSetAuthenticatedUserSchool = React.useMemo(
    () => !!school && isEmpty(state.school),
    [school, state.school]
  );
  const isReady = React.useMemo(
    () =>
      !isLoadingAuthenticatedUserData && !isLoadingAuthenticatedUserSchoolData,
    [isLoadingAuthenticatedUserData, isLoadingAuthenticatedUserSchoolData]
  );
  const [nav, setNav] = React.useState(<NavSilhouette />);
  const [routes, setRoutes] = React.useState(<SilhouetteRoutes />);
  const [footer, setFooter] = React.useState(<Empty />);
  const timezone = React.useMemo(
    () => (isReady ? state.user.timezone : undefined),
    [isReady, state.user.timezone]
  );

  React.useEffect(() => {
    if (!!timezone) {
      Settings.defaultZoneName = timezone;
    }
  }, [timezone]);

  React.useEffect(() => {
    if (shouldSetAuthenticatedUser) {
      dispatch({
        type: ACTION_TYPES.SET_USER,
        payload: user
      });
    }
  }, [dispatch, shouldSetAuthenticatedUser, user]);

  React.useEffect(() => {
    if (shouldSetAuthenticatedUserSchool) {
      dispatch({
        type: ACTION_TYPES.SET_SCHOOL,
        payload: school
      });
    }
  }, [dispatch, shouldSetAuthenticatedUserSchool, school]);

  React.useEffect(() => {
    if (isReady) {
      setNav(<AuthenticatedNav />);
      setRoutes(<Routes />);
      setFooter(<Footer />);
    }
  }, [isReady]);

  return (
    <React.Fragment>
      <VerifyEmailReminderBanner />
      {nav}
      <Box as="main" pb={12} bg="#fdfdfd" minH="100vh" h="100%">
        {routes}
      </Box>
      {footer}
    </React.Fragment>
  );
};

const SilhouetteRoutes = () => {
  return (
    <Router>
      <ScrollToTop default>
        <Empty path="/" />
        <Empty path="about-us" />
        <Empty path="frequently-asked-questions" />
        <Empty path="auth-action" />
        <FormSilhouette path="edit-user" />
        <UserSilhouette path="user/:id" />
        <SchoolSilhouette path="school/:id" />
        <FormSilhouette path="school/:id/edit" />
        <FormSilhouette path="create-event" />
        <EventSilhouette path="event/:id" />
        <FormSilhouette path="event/:id/edit" />
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
        <AboutUs path="about-us" />
        <FrequentlyAskedQuestions path="frequently-asked-questions" />
        <AuthAction path="auth-action" />
        <EditUser path="edit-user" />
        <User path="user/:id" />
        <School path="school/:id" />
        <EditSchool path="school/:id/edit" edit={true} />
        <CreateEvent path="create-event" />
        <Event path="event/:id" />
        <CreateEvent path="event/:id/edit" edit={true} />
        <NotFound default />
      </ScrollToTop>
    </Router>
  );
};

export default AuthenticatedApp;
