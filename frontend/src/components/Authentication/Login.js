import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description:
          error.response?.data?.message || "Invalid Email or Password",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="15px" color="black" w="100%">
      <FormControl isRequired id="email-login">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Email Address</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          fontSize="md"
          h="45px"
          borderRadius="lg"
          borderWidth="2px"
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
          transition="all 0.2s"
        />
      </FormControl>

      <FormControl isRequired id="password-login">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            fontSize="md"
            h="45px"
            borderRadius="lg"
            borderWidth="2px"
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
            transition="all 0.2s"
          />
          <InputRightElement width="4.5rem" h="45px">
            <Button size="sm" onClick={handleClick} variant="ghost" _hover={{ bg: "transparent", color: "purple.600" }}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        bgGradient="linear(to-r, purple.500, pink.500)"
        color="white"
        _hover={{ 
          bgGradient: "linear(to-r, purple.600, pink.600)",
          transform: "translateY(-2px)",
          boxShadow: "lg" 
        }}
        _active={{ transform: "translateY(0)" }}
        width="100%"
        h="45px"
        mt={4}
        isLoading={loading}
        onClick={submitHandler}
        fontSize="lg"
        fontWeight="bold"
        borderRadius="lg"
        transition="all 0.2s"
      >
        Login
      </Button>

      <Button
        variant="outline"
        colorScheme="orange"
        width="100%"
        h="45px"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
        fontSize="md"
        fontWeight="600"
        borderRadius="lg"
        transition="all 0.2s"
        _hover={{ bg: "orange.50", transform: "translateY(-2px)", boxShadow: "sm" }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
