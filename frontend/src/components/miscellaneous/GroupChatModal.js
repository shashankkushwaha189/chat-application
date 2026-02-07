import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent
          w={{ base: "90%", sm: "95%", md: "100%" }}
          mx="auto"
          maxW="md"
          borderRadius="lg"
        >
          <ModalHeader
            fontSize={{ base: "24px", md: "35px" }}
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            borderTopRadius="lg"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody d="flex" flexDir="column" alignItems="center" py={{ base: 3, md: 4 }}>
            <FormControl mb={4}>
              <Input
                placeholder="Chat Name"
                fontSize={{ base: "sm", md: "md" }}
                p={{ base: 2, md: 3 }}
                borderRadius="md"
                _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl mb={3}>
              <Input
                placeholder="Add Users eg: John, Piyush, Jane"
                fontSize={{ base: "sm", md: "md" }}
                p={{ base: 2, md: 3 }}
                borderRadius="md"
                _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap" mb={4}>
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
            ) : (
              <Box w="100%">
                {searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleGroup(user)}
                    />
                  ))}
              </Box>
            )}
          </ModalBody>
          <ModalFooter pt={{ base: 3, md: 4 }} borderTop="1px solid #e2e8f0">
            <Button
              onClick={handleSubmit}
              colorScheme="blue"
              w={{ base: "100%", md: "auto" }}
              fontSize={{ base: "sm", md: "md" }}
              p={{ base: 3, md: 4 }}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;