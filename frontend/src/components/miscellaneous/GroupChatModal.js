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
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon, CheckIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 2000,
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
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
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
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleModalClose = () => {
    setStep(1);
    setGroupChatName("");
    setSelectedUsers([]);
    setSearch("");
    setSearchResult([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      toast({
        title: "Please fill all the fields",
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
      handleModalClose();
      toast({
        title: "Group Created Successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response?.data || "Something went wrong",
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

      <Modal onClose={handleModalClose} isOpen={isOpen} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent
          maxW="md"
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="2xl"
        >
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
            bgGradient="linear(to-r, purple.600, blue.600)"
            color="white"
            py={6}
          >
            {step === 1 ? "Name your Group" : "Add Members"}
          </ModalHeader>
          <ModalCloseButton color="white" mt={4} />
          
          <ModalBody py={6}>
            <VStack spacing={6} w="100%">
              {step === 1 ? (
                <FormControl>
                  <Text mb={2} fontWeight="600" color="gray.600">Give your group a clear name</Text>
                  <Input
                    placeholder="e.g. Project Avengers, Family Fun"
                    size="lg"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                    borderRadius="xl"
                    autoFocus
                    _focus={{ borderColor: "purple.500", borderContentBox: "none" }}
                  />
                </FormControl>
              ) : (
                <VStack w="100%" spacing={4}>
                  <FormControl>
                    <HStack mb={2} justifyContent="space-between">
                      <Text fontWeight="600" color="gray.600">Who is joining?</Text>
                      <Text fontSize="xs" color="purple.500">{selectedUsers.length} selected</Text>
                    </HStack>
                    <Input
                      placeholder="Search users..."
                      size="lg"
                      borderRadius="xl"
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </FormControl>

                  <Box w="100%" display="flex" flexWrap="wrap" gap={2} maxH="100px" overflowY="auto" className="messages-container">
                    {selectedUsers.map((u) => (
                      <UserBadgeItem
                        key={u._id}
                        user={u}
                        handleFunction={() => handleDelete(u)}
                      />
                    ))}
                  </Box>

                  {loading ? (
                    <Box py={10}>
                      <Text color="gray.500">Finding users...</Text>
                    </Box>
                  ) : (
                    <Box w="100%" maxH="200px" overflowY="auto" className="messages-container" borderRadius="lg" bg="gray.50">
                      {searchResult?.map((user) => (
                        <UserListItem
                          key={user._id}
                          user={user}
                          handleFunction={() => handleGroup(user)}
                        />
                      ))}
                    </Box>
                  )}
                </VStack>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" py={4}>
            <HStack w="100%" justifyContent="space-between">
              {step === 2 && (
                <Button 
                  variant="ghost" 
                  leftIcon={<ArrowBackIcon />} 
                  onClick={() => setStep(1)}
                  borderRadius="full"
                >
                  Back
                </Button>
              )}
              
              {step === 1 ? (
                <Button
                  colorScheme="purple"
                  w="100%"
                  rightIcon={<ArrowForwardIcon />}
                  isDisabled={!groupChatName.trim()}
                  onClick={() => setStep(2)}
                  borderRadius="full"
                >
                  Next
                </Button>
              ) : (
                <Button
                  colorScheme="green"
                  onClick={handleSubmit}
                  isLoading={loading}
                  leftIcon={<CheckIcon />}
                  isDisabled={selectedUsers.length === 0}
                  borderRadius="full"
                  px={8}
                >
                  Create Group
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;