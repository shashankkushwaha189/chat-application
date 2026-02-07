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
import { useHistory } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const toast = useToast();
  const history = useHistory();

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
      history.push("/chats");
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
    <VStack spacing={{ base: "4px", md: "5px" }} w={{ base: "100%", md: "auto" }}>
      <FormControl isRequired>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Name</FormLabel>
        <Input
          placeholder="Enter your name"
          fontSize={{ base: "sm", md: "md" }}
          p={{ base: 2, md: 3 }}
          borderRadius="md"
          _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          fontSize={{ base: "sm", md: "md" }}
          p={{ base: 2, md: 3 }}
          borderRadius="md"
          _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            fontSize={{ base: "sm", md: "md" }}
            p={{ base: 2, md: 3 }}
            borderRadius="md"
            _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size={{ base: "xs", md: "sm" }} onClick={handleClick} variant="ghost">
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            fontSize={{ base: "sm", md: "md" }}
            p={{ base: 2, md: 3 }}
            borderRadius="md"
            _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size={{ base: "xs", md: "sm" }} onClick={handleClick} variant="ghost">
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel fontSize={{ base: "sm", md: "md" }}>Upload Picture</FormLabel>
        <Input
          type="file"
          accept="image/*"
          fontSize={{ base: "xs", md: "sm" }}
          p={{ base: 1, md: 2 }}
          borderRadius="md"
          _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
          onChange={(e) => postDetails(e.target.files[0])}
        />
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
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
