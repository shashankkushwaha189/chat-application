import { FormControl, Input, Box, Text, IconButton, Spinner, useToast, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import "./styles.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon, ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import TypingIndicator from "./TypingIndicator";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data.messages || data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response?.data?.message || "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const clearChatHandler = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      await axios.delete(`/api/message/clear/${selectedChat._id}`, config);
      setMessages([]);
      setLoading(false);
      toast({
        title: "Chat Cleared",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to clear the chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    if (user) {
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }

    return () => {
      if (socket) {
        socket.off("connected");
        socket.off("typing");
        socket.off("stop typing");
        socket.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    
    // Clear notifications for the selected chat
    if (selectedChat) {
      setNotification((prevNotification) => 
        prevNotification.filter((n) => n.chat._id !== selectedChat._id)
      );
    }
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        setNotification((prevNotification) => {
          // Check for duplicate notification by message _id
          if (!prevNotification.some((n) => n._id === newMessageRecieved._id)) {
            setFetchAgain((prev) => !prev);
            return [newMessageRecieved, ...prevNotification];
          }
          return prevNotification;
        });
      } else {
        setFetchAgain((prev) => !prev);
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
      }
    });

    return () => {
      socket.off("message recieved");
    };
  }, [user, setNotification, setFetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="100%"
      w="100%"
      overflow="hidden"
    >
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "24px", md: "30px" }}
            pb={3}
            px={4}
            w="100%"
            fontFamily="Inter"
            fontWeight="bold"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            color="purple.700"
            flexShrink={0}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                bg="purple.50"
                _hover={{ bg: "purple.100" }}
                borderRadius="full"
                size="sm"
              />
              {messages &&
                (!selectedChat.isGroupChat ? (
                  <>
                    {getSender(user, selectedChat.users)}
                  </>
                ) : (
                  <>
                    {selectedChat.chatName.toUpperCase()}
                  </>
                ))}
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              {!selectedChat.isGroupChat ? (
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              ) : (
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              )}
              <Menu>
                <MenuButton as={IconButton} icon={<ChevronDownIcon />} size="sm" variant="ghost" />
                <MenuList color="black" fontSize="md">
                  <MenuItem 
                    icon={<DeleteIcon />} 
                    color="red.500" 
                    onClick={clearChatHandler}
                    _hover={{ bg: "red.50" }}
                  >
                    Clear Chat
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDir="column"
            p={3}
            bg="rgba(240, 242, 245, 0.8)"
            backdropFilter="blur(5px)"
            w="100%"
            flex="1"
            borderRadius="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="white"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="purple.500"
              />
            ) : (
              <Box
                className="messages"
                flex="1"
                overflowY="auto"
                mb={2}
              >
                <ScrollableChat messages={messages} setMessages={setMessages} />
              </Box>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="message-input"
              isRequired
              mt="auto"
            >
              {istyping && <TypingIndicator />}
              <Box display="flex" gap={2} alignItems="center" bg="white" p={2} borderRadius="xl" boxShadow="sm">
                <Input
                  variant="unstyled"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  px={4}
                  fontSize={{ base: "sm", md: "md" }}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<i className="fas fa-paper-plane"></i>}
                  onClick={() => sendMessage({ key: "Enter" })}
                  colorScheme="purple"
                  borderRadius="lg"
                  size="md"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.1)" }}
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%" flexDir="column" gap={4}>
          <Box boxSize="200px" opacity={0.6} transition="all 0.5s" _hover={{ opacity: 1, transform: "scale(1.05)" }}>
            <i className="fas fa-comments" style={{ fontSize: "150px", color: "#805AD5" }}></i>
          </Box>
          <Text
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="600"
            fontFamily="Inter"
            textAlign="center"
            px={4}
            color="purple.400"
          >
            Select a conversation to start chatting
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;