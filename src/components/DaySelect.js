import React from "react";
import { Select } from "@chakra-ui/react";

// Constants
import { DAYS } from "constants/dateTime";

const OPTIONS = DAYS.map(day => (
  <option key={day} value={day}>
    {day}
  </option>
));

const DaySelect = ({ children, ...rest }) => {
  return (
    <Select {...rest}>
      <option value="">Select day</option>
      {OPTIONS}
    </Select>
  );
};

export default DaySelect;
