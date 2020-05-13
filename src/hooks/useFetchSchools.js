import React from "react";
import sortBy from "lodash.sortby";
import keyBy from "lodash.keyby";

// Other
import { firebaseFirestore } from "../firebase";
import { mapSchool } from "../utilities";

// Hooks
import useLocalStorage from "./useLocalStorage";

const useFetchSchools = () => {
  const [localStorageSchools, setSchoolsInLocalStorage] = useLocalStorage(
    "cgn.schools",
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [schools, setSchools] = React.useState(null);
  const [error, setError] = React.useState(null);

  const saveToLocalStorage = React.useCallback(() => {
    setSchoolsInLocalStorage(schools);
    setTimeout(() => {
      setIsLoading(false);
      // Wait some random amount of time before setting to false
      // because I dont know of a way to check if the localstorage
      // has finished being set or not. This is to ensure we dont
      // make the api request more than once. Hopefully someone
      // smarter than me knows a better solution.
    }, 5000);
  }, [setSchoolsInLocalStorage, schools]);

  React.useEffect(() => {
    const fetchSchools = async () => {
      console.log("fetchSchools...");

      firebaseFirestore
        .collection("schools")
        .get()
        .then(snapshot => {
          const schools = keyBy(
            sortBy(
              snapshot.docs.map(doc => mapSchool(doc.data(), doc)),
              ["name"]
            ),
            "id"
          );

          setSchools(schools);
          saveToLocalStorage();
        })
        .catch(error => {
          console.error({ error });
          setError(error);
          setIsLoading(false);
        });
    };

    if (!isLoading && !localStorageSchools) {
      setIsLoading(true);
      fetchSchools();
    } else if (!schools && localStorageSchools) {
      setSchools(localStorageSchools);
    }
  }, [saveToLocalStorage, isLoading, localStorageSchools, schools]);

  return [schools, isLoading, error];
};

export default useFetchSchools;
