import React from "react";
import startCase from "lodash.startcase";
import { Text, Spinner, Flex, Box } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSchool } from "@fortawesome/free-solid-svg-icons";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText
} from "@reach/combobox";
import useDebounce from "src/hooks/useDebounce";
import { firebase } from "src/firebase";
import { mapSchool } from "src/utilities/school";
import { isDev } from "src/utilities/other";
import useLocalStorage from "src/hooks/useLocalStorage";
import keyBy from "lodash.keyby";
import { useAppDispatch, ACTION_TYPES } from "src/store";

import SchoolLogo from "src/components/SchoolLogo";

const LOCAL_STORAGE_SCHOOLS_KEY = isDev() ? "cgn_dev.schools" : "cgn.schools";
const LOCAL_STORAGE_SCHOOLS_QUERY_KEY = isDev()
  ? "cgn_dev.schools_query"
  : "cgn.schools_query";

const SchoolSearch = props => {
  const dispatch = useAppDispatch();
  const [localStorageSchools, setSchoolsInLocalStorage] = useLocalStorage(
    LOCAL_STORAGE_SCHOOLS_KEY,
    null
  );
  const [
    localStorageSchoolQueries,
    setSchoolsQueryInLocalStorage
  ] = useLocalStorage(LOCAL_STORAGE_SCHOOLS_QUERY_KEY, null);

  const [searchTerm, setSearchTerm] = React.useState(props.schoolName || "");
  const [isFetching, setIsFetching] = React.useState(false);

  const handleChange = event => setSearchTerm(event.target.value);

  const debouncedSchoolSearch = useDebounce(searchTerm, 250);

  const useSchoolSearch = debouncedSchoolSearch => {
    const [schools, setSchools] = React.useState(null);

    React.useEffect(() => {
      const _debouncedSchoolSearch = debouncedSchoolSearch.trim();

      if (_debouncedSchoolSearch !== "" && _debouncedSchoolSearch.length > 3) {
        let isFresh = true;
        setIsFetching(true);

        fetchSchools(debouncedSchoolSearch).then(schools => {
          if (isFresh) {
            setSchools(schools);
            setIsFetching(false);
          }
        });
        return () => (isFresh = false);
      }
    }, [debouncedSchoolSearch]);

    return schools;
  };

  const fetchSchools = searchTerm => {
    const value = searchTerm ? searchTerm.trim().toLowerCase() : "";
    const cachedQueryResults = localStorageSchoolQueries
      ? localStorageSchoolQueries[value]
      : null;

    if (cachedQueryResults && cachedQueryResults.length > 0) {
      return Promise.resolve(
        Object.entries(localStorageSchools)
          .filter(entry => cachedQueryResults.includes(entry[0]))
          .map(entry => entry[1])
          .slice(0, 10)
      );
    }

    const searchSchools = firebase.functions().httpsCallable("searchSchools");

    return searchSchools({ query: value }).then(result => {
      if (
        result &&
        result.data &&
        result.data.hits &&
        result.data.hits.length > 0
      ) {
        const mappedSchools = result.data.hits.map(hit => mapSchool(hit));
        const schools = {
          ...localStorageSchools,
          ...keyBy(mappedSchools, "objectID")
        };

        setSchoolsInLocalStorage(schools);
        setSchoolsQueryInLocalStorage({
          ...localStorageSchoolQueries,
          [value]: result.data.hits.map(hit => hit.objectID)
        });
        dispatch({
          type: ACTION_TYPES.SET_SCHOOLS,
          payload: schools
        });

        return mappedSchools.slice(0, 10);
      }

      return [];
    });
  };

  const results = useSchoolSearch(debouncedSchoolSearch);

  const handleSchoolSelect = selectedSchool => {
    const [schoolName, location] = selectedSchool.split(" – ");
    const [city, state] = location.split(", ");
    const matchedSchool = results.find(
      school =>
        startCase(school.name.toLowerCase()) ===
          startCase(schoolName.toLowerCase()) &&
        school.city.toLowerCase() === city.toLowerCase() &&
        school.state.toLowerCase() === state.toLowerCase()
    );

    props.onSelect(matchedSchool);

    if (matchedSchool) {
      if (props.clearInputOnSelect) {
        setSearchTerm("");
      } else {
        setSearchTerm(selectedSchool);
      }
    }
  };

  return (
    <Combobox
      aria-label="School"
      name={props.name || "school"}
      onSelect={handleSchoolSelect}
    >
      <Flex align="center">
        <ComboboxInput
          id={props.id || "school"}
          name={props.name || "school"}
          placeholder={props.inputPlaceholder || "Search schools"}
          onChange={handleChange}
          value={searchTerm}
        />
        {isFetching ? (
          <Spinner
            color="orange.500"
            emptyColor="gray.100"
            speed="0.65s"
            thickness="3px"
            ml={2}
          />
        ) : null}
      </Flex>
      {results ? (
        <ComboboxPopover>
          {results.length > 0 ? (
            <ComboboxList>
              {results.map(school => {
                const value = `${startCase(
                  school.name.toLowerCase()
                )} – ${startCase(school.city.toLowerCase())}, ${school.state}`;

                return (
                  <ComboboxOption key={school.objectID} value={value}>
                    <Flex align="center">
                      <Box h={6} w={6} mr={2} rounded="full" bg="gray.100">
                        <SchoolLogo
                          schoolId={school.objectID}
                          schoolName={school.name}
                          fallback={
                            <Flex
                              align="center"
                              justify="center"
                              color="gray.400"
                              h={6}
                              w={6}
                              mr={2}
                            >
                              <FontAwesomeIcon icon={faSchool} />
                            </Flex>
                          }
                        />
                      </Box>
                      <Text>
                        <ComboboxOptionText />
                      </Text>
                    </Flex>
                  </ComboboxOption>
                );
              })}
            </ComboboxList>
          ) : (
            <Text as="span" d="block">
              No results found
            </Text>
          )}
        </ComboboxPopover>
      ) : null}
    </Combobox>
  );
};

export default SchoolSearch;
