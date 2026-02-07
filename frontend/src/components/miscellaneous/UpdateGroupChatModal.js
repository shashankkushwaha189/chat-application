import { ViewIcon } from "@chakra-ui/icons";
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
  IconButton,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useRef } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      console.log(data._id);
      // setSelectedChat("");
      setSelectedChat(data);
      if (setFetchAgain) setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      setGroupChatName("");
      setChats(chats.map((c) => (c._id === data._id ? data : c)));
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      if (setFetchAgain) setFetchAgain(!fetchAgain);
      setChats(chats.map((c) => (c._id === data._id ? data : c)));
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      if (user1._id === user._id) {
        setSelectedChat();
        setChats(chats.filter((c) => c._id !== data._id));
      } else {
        setSelectedChat(data);
        setChats(chats.map((c) => (c._id === data._id ? data : c)));
        fetchMessages();
      }
      if (setFetchAgain) setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} size={{ base: "sm", md: "md" }} />

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
            isTruncated
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton color="white" />
          <ModalBody d="flex" flexDir="column" alignItems="center" py={{ base: 3, md: 4 }}>
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl d="flex" mb={4} gap={2}>
              <Input
                placeholder="Chat Name"
                fontSize={{ base: "sm", md: "md" }}
                p={{ base: 2, md: 3 }}
                value={groupChatName}
                _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                isLoading={renameloading}
                onClick={handleRename}
                fontSize={{ base: "sm", md: "md" }}
                px={{ base: 3, md: 4 }}
              >
                Update
              </Button>
            </FormControl>
            <FormControl mb={4}>
              <Input
                placeholder="Add User to group"
                fontSize={{ base: "sm", md: "md" }}
                p={{ base: 2, md: 3 }}
                _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              <Box w="100%">
                {searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))}
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid #e2e8f0" pt={{ base: 3, md: 4 }}>
            <Button onClick={onAlertOpen} colorScheme="red" w={{ base: "100%", md: "auto" }} fontSize={{ base: "sm", md: "md" }}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent w={{ base: "90%", sm: "95%", md: "100%" }} mx="auto" borderRadius="lg">
            <AlertDialogHeader fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)" color="white" borderTopRadius="lg">
              Leave Group
            </AlertDialogHeader>

            <AlertDialogBody fontSize={{ base: "sm", md: "md" }} py={4}>
              Are you sure you want to leave this group?
            </AlertDialogBody>

            <AlertDialogFooter borderTop="1px solid #e2e8f0" gap={2}>
              <Button ref={cancelRef} onClick={onAlertClose} fontSize={{ base: "sm", md: "md" }}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={async () => {
                  await handleRemove(user);
                  onAlertClose();
                }} 
                isLoading={loading}
                fontSize={{ base: "sm", md: "md" }}
              >
                Leave
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default UpdateGroupChatModal;