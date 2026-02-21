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
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(10px)"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.3)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.2)"
      >
        <Text
          textAlign="center"
          fontSize="5xl"
          fontWeight="bold"
          fontFamily="Inter"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
        >
          Chat -X
        </Text>
      </Box>
      <Box
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(8px)"
        w="100%"
        p={6}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.3)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.1)"
        color="black"
      >
        <Tabs variant="soft-rounded" colorScheme="purple">
          <TabList mb="1em">
            <Tab width="50%" _selected={{ color: "white", bg: "purple.500" }} fontWeight="600">
              Login
            </Tab>
            <Tab width="50%" _selected={{ color: "white", bg: "pink.500" }} fontWeight="600">
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
