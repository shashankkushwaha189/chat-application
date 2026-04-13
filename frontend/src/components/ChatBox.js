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
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius={{ base: "xl", md: "xl" }}
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      overflow="hidden"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;