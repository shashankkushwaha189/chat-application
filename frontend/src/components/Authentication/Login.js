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
    <VStack spacing={{ base: "4px", md: "5px" }} color="black" w={{ base: "100%", md: "auto" }}>
      <FormControl isRequired>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Email Address</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          fontSize={{ base: "sm", md: "md" }}
          p={{ base: 2, md: 3 }}
          borderRadius="md"
          _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            fontSize={{ base: "sm", md: "md" }}
            p={{ base: 2, md: 3 }}
            borderRadius="md"
            _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
          />
          <InputRightElement width="4.5rem">
            <Button size={{ base: "xs", md: "sm" }} onClick={handleClick} variant="ghost">
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        _hover={{ opacity: 0.9 }}
        width="100%"
        mt={3}
        isLoading={loading}
        onClick={submitHandler}
        fontSize={{ base: "sm", md: "md" }}
        p={{ base: 3, md: 4 }}
        borderRadius="md"
      >
        Login
      </Button>

      <Button
        colorScheme="orange"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
        fontSize={{ base: "sm", md: "md" }}
        p={{ base: 3, md: 4 }}
        borderRadius="md"
        transition="all 0.2s ease"
        _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
