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
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // old states (kept)
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  // new naming added
  const [confirmPassword, setConfirmPassword] = useState();

  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = () => setShow(!show);

  // 🔐 Submit signup
  const submitHandler = async () => {
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful",
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
          error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  // 📸 Cloudinary upload
  const postDetails = (pics) => {
    setLoading(true);

    if (pics === undefined) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "ducwhuj56");

      fetch("https://api.cloudinary.com/v1_1/ducwhuj56/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please select a JPEG or PNG image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="15px" w="100%">
      <FormControl isRequired id="first-name">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Name</FormLabel>
        <Input
          placeholder="Enter your name"
          fontSize="md"
          h="45px"
          borderRadius="lg"
          borderWidth="2px"
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
          transition="all 0.2s"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired id="email-signup">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          fontSize="md"
          h="45px"
          borderRadius="lg"
          borderWidth="2px"
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
          transition="all 0.2s"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired id="password-signup">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            fontSize="md"
            h="45px"
            borderRadius="lg"
            borderWidth="2px"
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
            transition="all 0.2s"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem" h="45px">
            <Button size="sm" onClick={handleClick} variant="ghost" _hover={{ bg: "transparent", color: "purple.600" }}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired id="confirm-password">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            fontSize="md"
            h="45px"
            borderRadius="lg"
            borderWidth="2px"
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
            transition="all 0.2s"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem" h="45px">
            <Button size="sm" onClick={handleClick} variant="ghost" _hover={{ bg: "transparent", color: "purple.600" }}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic">
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Upload Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          h="45px"
          borderRadius="lg"
          borderWidth="2px"
          _focus={{ borderColor: "purple.500" }}
          onChange={(e) => postDetails(e.target.files[0])}
        />
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
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
