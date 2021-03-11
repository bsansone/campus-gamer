import React from "react";
import { Box, Flex } from "@chakra-ui/react";

// Components
import NavWrapper from "src/components/NavWrapper";
import Logo from "src/components/Logo";

const NavSilhouette = () => {
  return (
    <NavWrapper>
      <Flex align="center" mr={5}>
        <Logo height="35px" p={1} />
      </Flex>

      <Box bg="gray.600" w="350px" h="35px" borderRadius="md" />

      <Flex
        width="auto"
        alignItems="center"
        flexGrow={1}
        justifyContent="flex-end"
      >
        <Box bg="gray.600" w="65px" h="35px" mr="2" borderRadius="md" />
        <Box bg="gray.600" w="125px" h="35px" borderRadius="md" />
      </Flex>
    </NavWrapper>
  );
};

export default NavSilhouette;
