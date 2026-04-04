import { Box } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat";
const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      flexDir="column"
      p={{ base: 1, md: 3 }}
      bg="rgba(255, 255, 255, 0.25)"
      backdropFilter="blur(20px) saturate(180%)"
      w={{ base: "100%", md: "68%" }}
      borderRadius={{ base: "2xl", md: "3xl" }}
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.4)"
      boxShadow="0 8px 32px rgba(31, 38, 135, 0.1)"
      overflow="hidden"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;