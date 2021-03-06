// Libraries
import React from "react";
import startCase from "lodash.startcase";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  Input,
  Stack,
  FormControl,
  FormLabel,
  Text,
  Select,
  Button,
  Divider,
  useToast,
  Heading,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import isEmpty from "lodash.isempty";
import { useRouter } from "next/router";
import firebaseAdmin from "src/firebaseAdmin";
import nookies from "nookies";

// Constants
import { BASE_USER, STUDENT_STATUS_OPTIONS } from "src/constants/user";
import { COLLECTIONS } from "src/constants/firebase";
import { AUTH_STATUS } from "src/constants/auth";
import {
  COOKIES,
  PRODUCTION_URL,
  REDIRECT_HOME,
  BASE_ERROR_MESSAGE,
} from "src/constants/other";

// Utilities
import { createGravatarHash } from "src/utilities/user";
import { validateSignUp } from "src/utilities/validation";

// Components
import Article from "src/components/Article";
import Card from "src/components/Card";
import Link from "src/components/Link";
import SchoolSearch from "src/components/SchoolSearch";
import SiteLayout from "src/components/SiteLayout";

// Other
import firebase from "src/firebase";

////////////////////////////////////////////////////////////////////////////////
// getServerSideProps

export const getServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const token =
      Boolean(cookies) && Boolean(cookies[COOKIES.AUTH_TOKEN])
        ? await firebaseAdmin.auth().verifyIdToken(cookies[COOKIES.AUTH_TOKEN])
        : null;
    const authStatus =
      Boolean(token) && Boolean(token.uid)
        ? AUTH_STATUS.AUTHENTICATED
        : AUTH_STATUS.UNAUTHENTICATED;

    if (authStatus === AUTH_STATUS.AUTHENTICATED) {
      return REDIRECT_HOME;
    }
  } catch (error) {
    return REDIRECT_HOME;
  }

  return { props: {} };
};

////////////////////////////////////////////////////////////////////////////////
// Form Reducer

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  school: {},
  status: "",
};

const formReducer = (state, { field, value }) => {
  return {
    ...state,
    [field]: value,
  };
};

////////////////////////////////////////////////////////////////////////////////
// Signup

const Signup = () => {
  const router = useRouter();
  const toast = useToast();
  const [formState, formDispatch] = React.useReducer(
    formReducer,
    initialFormState
  );
  const handleFieldChange = React.useCallback((e) => {
    formDispatch({ field: e.target.name, value: e.target.value });
  }, []);
  const onSchoolSelect = (school) => {
    formDispatch({ field: "school", value: school });
  };
  const [error, setError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const hasErrors = React.useMemo(() => !isEmpty(errors), [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const { isValid, errors } = validateSignUp({
      ...formState,
      school: formState.school.id,
    });

    setErrors(errors);

    if (!isValid) {
      setIsSubmitting(false);
      window.scrollTo(0, 0);
      return;
    }

    let user;

    try {
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(formState.email, formState.password);

      if (response?.user) {
        user = response.user;
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
      setIsSubmitting(false);
      window.scrollTo(0, 0);
      return;
    }

    if (Boolean(user)) {
      try {
        await firebase.auth().currentUser.sendEmailVerification();
        await firebase.auth().currentUser.getIdToken(true);

        toast({
          title: "Verification email sent.",
          description: `A verification email has been sent to ${formState.email}. Please check your inbox and follow the instructions in the email.`,
          status: "success",
          isClosable: true,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Verification email error.",
          description: `There was an issue sending a verification email to ${formState.email}. ${BASE_ERROR_MESSAGE}`,
          status: "error",
          isClosable: true,
        });
      }

      try {
        await firebase
          .firestore()
          .collection(COLLECTIONS.USERS)
          .doc(user.uid)
          .set({
            ...BASE_USER,
            id: user.uid,
            firstName: formState.firstName,
            lastName: formState.lastName,
            status: formState.status,
            gravatar: createGravatarHash(formState.email),
            school: {
              ref: firebase
                .firestore()
                .collection(COLLECTIONS.SCHOOLS)
                .doc(formState.school.id),
              id: formState.school.id,
              name: formState.school.name,
            },
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
            updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
          });

        toast({
          title: "Account creation successful.",
          description:
            "Your account has successfully been created, welcome to Campus Gaming Network!",
          status: "success",
          isClosable: true,
        });

        router.push("/");
      } catch (error) {
        console.error(error);
        setError(
          `There was an issue creating your user. ${BASE_ERROR_MESSAGE}`
        );
        setIsSubmitting(false);
        window.scrollTo(0, 0);
      }
    } else {
      setError(
        `There was an issue when creating your account. ${BASE_ERROR_MESSAGE}`
      );
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <SiteLayout
      meta={{ title: "Sign Up", og: { url: `${PRODUCTION_URL}/signup` } }}
    >
      <Article fullWidthMobile>
        {hasErrors ? (
          <Alert status="error" mb={4} rounded="lg">
            <AlertIcon />
            <AlertDescription>
              There are errors in the form below. Please review and correct
              before submitting again.
            </AlertDescription>
          </Alert>
        ) : null}
        <Card as="form" p={12} onSubmit={handleSubmit}>
          <Heading as="h2" size="2xl">
            Create an account
          </Heading>
          <Text color="gray.500">It's free!</Text>
          <Divider borderColor="gray.300" mt={12} mb={10} />
          {error ? (
            <Alert status="error" mb={12} rounded="lg">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <DetailSection
            handleFieldChange={handleFieldChange}
            errors={errors}
            firstName={formState.firstName}
            lastName={formState.lastName}
            email={formState.email}
            password={formState.password}
          />
          <SchoolSection
            handleFieldChange={handleFieldChange}
            errors={errors}
            status={formState.status}
            onSchoolSelect={onSchoolSelect}
          />
          <Button
            colorScheme="brand"
            type="submit"
            size="lg"
            w="full"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Submitting..."
            my={12}
          >
            Sign Up
          </Button>
          <Text>
            Already a member?{" "}
            <Link href="/login" color="brand.500" fontWeight={600}>
              Log in
            </Link>
          </Text>
        </Card>
      </Article>
    </SiteLayout>
  );
};

////////////////////////////////////////////////////////////////////////////////
// DetailSection

const DetailSection = React.memo((props) => {
  const [isShowingPassword, setIsShowingPassword] = React.useState(false);
  const togglePasswordVisibility = () => {
    setIsShowingPassword(!isShowingPassword);
  };

  return (
    <Stack spacing={6}>
      <FormControl isRequired isInvalid={props.errors.firstName}>
        <FormLabel htmlFor="firstName" fontSize="lg" fontWeight="bold">
          First Name
        </FormLabel>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="Jane"
          onChange={props.handleFieldChange}
          value={props.firstName}
          size="lg"
        />
        <FormErrorMessage>{props.errors.firstName}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={props.errors.lastName}>
        <FormLabel htmlFor="lastName" fontSize="lg" fontWeight="bold">
          Last Name
        </FormLabel>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Doe"
          onChange={props.handleFieldChange}
          value={props.lastName}
          size="lg"
        />
        <FormErrorMessage>{props.errors.lastName}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={props.errors.email}>
        <FormLabel htmlFor="email" fontSize="lg" fontWeight="bold">
          Email
        </FormLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jdoe@gmail.com"
          onChange={props.handleFieldChange}
          value={props.email}
          size="lg"
          aria-describedby="email-helper-text"
        />
        <FormHelperText id="email-helper-text">
          This is what you will use for logging in.
        </FormHelperText>
        <FormErrorMessage>{props.errors.email}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={props.errors.password}>
        <FormLabel htmlFor="password" fontSize="lg" fontWeight="bold">
          Password
        </FormLabel>
        <Input
          id="password"
          name="password"
          type={isShowingPassword ? "text" : "password"}
          placeholder="******************"
          onChange={props.handleFieldChange}
          value={props.password}
          size="lg"
        />
        <Button
          onClick={togglePasswordVisibility}
          fontSize="sm"
          fontStyle="italic"
          variant="link"
          fontWeight="normal"
        >
          {isShowingPassword ? "Hide" : "Show"} password
        </Button>
        <FormErrorMessage>{props.errors.password}</FormErrorMessage>
      </FormControl>
    </Stack>
  );
});

////////////////////////////////////////////////////////////////////////////////
// SchoolSection

const SchoolSection = React.memo((props) => {
  return (
    <Stack spacing={6} pt={6}>
      <FormControl isRequired isInvalid={props.errors.school}>
        <FormLabel htmlFor="school" fontSize="lg" fontWeight="bold">
          School
        </FormLabel>
        <SchoolSearch onSelect={props.onSchoolSelect} />
        <FormErrorMessage>{props.errors.school}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={props.errors.status}>
        <FormLabel htmlFor="status" fontSize="lg" fontWeight="bold">
          Status
        </FormLabel>
        <Select
          id="status"
          name="status"
          onChange={props.handleFieldChange}
          value={props.status}
          size="lg"
        >
          {STUDENT_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {startCase(status.label)}
            </option>
          ))}
        </Select>
        <FormErrorMessage>{props.errors.status}</FormErrorMessage>
      </FormControl>
    </Stack>
  );
});

export default Signup;
