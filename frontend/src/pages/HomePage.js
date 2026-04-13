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
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Text
          textAlign="center"
          fontSize="4xl"
          fontWeight="600"
          fontFamily="Inter"
          color="#128C7E"
        >
          Chat -X
        </Text>
      </Box>
      <Box
        bg="white"
        w="100%"
        p={8}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
        color="black"
      >
        <Tabs variant="enclosed" colorScheme="green">
          <TabList mb="1em" borderColor="gray.200">
            <Tab width="50%" _selected={{ color: "#25D366", borderColor: "gray.200", borderBottomColor: "white" }} fontWeight="600" transition="all 0.3s">
              Login
            </Tab>
            <Tab width="50%" _selected={{ color: "#25D366", borderColor: "gray.200", borderBottomColor: "white" }} fontWeight="600" transition="all 0.3s">
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
