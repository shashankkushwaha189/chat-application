import React, { useEffect } from "react";
import { Container, Box, Text,Tab,Tabs ,TabList,TabPanel,TabPanels } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    let userInfo = null;
    try {
      userInfo = JSON.parse(localStorage.getItem("userInfo"));
    } catch (error) {
      localStorage.removeItem("userInfo");
    }
    if (userInfo) {
      navigate("/chats");
    }
  }, [navigate]);
  return (
    <Container maxW="xl" centerContent p={{ base: 4, md: 0 }}>
      <Box
        display="flex"
        justifyContent="center"
        p={4}
        bg="rgba(255, 255, 255, 0.4)"
        backdropFilter="blur(20px) saturate(180%)"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="whiteAlpha.600"
        boxShadow="0 8px 32px rgba(31, 38, 135, 0.1)"
      >
        <Text
          textAlign="center"
          fontSize="5xl"
          fontWeight="900"
          letterSpacing="tight"
          fontFamily="Inter"
          bgGradient="linear(to-r, purple.700, purple.500)"
          bgClip="text"
          textShadow="0px 1px 2px rgba(0,0,0,0.1)"
        >
          Chat -X
        </Text>
      </Box>
      <Box
        bg="rgba(255, 255, 255, 0.4)"
        backdropFilter="blur(20px) saturate(180%)"
        w="100%"
        p={8}
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="whiteAlpha.600"
        boxShadow="0 8px 32px rgba(31, 38, 135, 0.1)"
        color="black"
      >
        <Tabs variant="soft-rounded" colorScheme="purple">
          <TabList mb="1em">
            <Tab width="50%" _selected={{ color: "white", bgGradient: "linear(to-r, purple.600, purple.400)", boxShadow: "0 4px 12px rgba(128, 90, 213, 0.4)" }} fontWeight="600" transition="all 0.3s">
              Login
            </Tab>
            <Tab width="50%" _selected={{ color: "white", bgGradient: "linear(to-r, pink.600, pink.400)", boxShadow: "0 4px 12px rgba(213, 63, 140, 0.4)" }} fontWeight="600" transition="all 0.3s">
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
