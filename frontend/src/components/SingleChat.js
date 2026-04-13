import { FormControl, Input, Box, Text, IconButton, Spinner, useToast, Menu, MenuButton, MenuList, MenuItem, Flex } from "@chakra-ui/react";
import "./styles.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaMicrophone, FaVideo, FaHeadphones, FaStop, FaImage } from "react-icons/fa";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import TypingIndicator from "./TypingIndicator";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Use Render backend URL in production
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const toast = useToast();

  const [currentSuggestions, setCurrentSuggestions] = useState([]);

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

  const sendMessage = async (event, suggestionText) => {
    const textToSend = suggestionText || newMessage;
    if ((event.key === "Enter" || event.type === "click") && textToSend) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        setCurrentSuggestions([]);
        const { data } = await axios.post(
          "/api/message",
          {
            content: textToSend,
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
      setFetchAgain(!fetchAgain); // Refresh Sidebar
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

  const deleteChatHandler = async () => {
    // ... code existing ...
  };

  const sendMediaMessage = async (fileUrl, messageType) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        {
          content: messageType.charAt(0).toUpperCase() + messageType.slice(1) + " Message",
          chatId: selectedChat._id,
          messageType,
          fileUrl,
        },
        config
      );
      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send media message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/message/upload", formData, config);
      await sendMediaMessage(data.fileUrl, type);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to upload file",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setMediaLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const file = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
        
        const formData = new FormData();
        formData.append("file", file);

        setMediaLoading(true);
        try {
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.post("/api/message/upload", formData, config);
          await sendMediaMessage(data.fileUrl, "voice");
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send voice message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        } finally {
          setMediaLoading(false);
          setIsRecording(false);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
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
            
            // Show toast notification popup
            toast({
              title: `New Message from ${
                newMessageRecieved.chat.isGroupChat
                  ? newMessageRecieved.chat.chatName
                  : newMessageRecieved.sender.name
              }`,
              description: newMessageRecieved.messageType !== "text" && newMessageRecieved.messageType 
                ? newMessageRecieved.messageType.charAt(0).toUpperCase() + newMessageRecieved.messageType.slice(1) + " received"
                : newMessageRecieved.content.length > 30 ? newMessageRecieved.content.substring(0, 30) + '...' : newMessageRecieved.content,
              status: "info",
              duration: 5000,
              isClosable: true,
              position: "top-right",
              variant: "solid",
            });

            return [newMessageRecieved, ...prevNotification];
          }
          return prevNotification;
        });
      } else {
        setFetchAgain((prev) => !prev);
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
        console.log("INCOMING MESSAGE PAYLOAD:", newMessageRecieved);

        if (newMessageRecieved.suggestedReplies && newMessageRecieved.suggestedReplies.length > 0) {
          setCurrentSuggestions(newMessageRecieved.suggestedReplies);
        } else {
          setCurrentSuggestions([]);
        }
      }
    });

    socket.on("message deleted", (messageId) => {
      setMessages((prevMessages) => prevMessages.filter((m) => m._id !== messageId));
    });

    return () => {
      socket.off("message recieved");
      socket.off("message deleted");
    };
  }, [user, setNotification, setFetchAgain, toast]);

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
            fontSize={{ base: "24px", md: "28px" }}
            py={3}
            px={4}
            w="100%"
            fontFamily="Inter"
            fontWeight="600"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            color="black"
            bg="#f0f2f5"
            borderBottom="1px solid"
            borderColor="gray.200"
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
                size="md"
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
                <MenuButton as={IconButton} icon={<ChevronDownIcon />} size="md" variant="ghost" />
                <MenuList color="black" fontSize="md">
                  <MenuItem 
                    icon={<DeleteIcon />} 
                    color="red.500" 
                    onClick={clearChatHandler}
                    _hover={{ bg: "red.50" }}
                  >
                    Clear Chat
                  </MenuItem>
                  <MenuItem 
                    icon={<DeleteIcon />} 
                    color="red.600" 
                    onClick={deleteChatHandler}
                    _hover={{ bg: "red.50" }}
                  >
                    Delete Chat
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDir="column"
            p={3}
            bg="#efeae2"
            w="100%"
            flex="1"
            overflow="hidden"
            overflowX="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="green.500"
              />
            ) : (
              <Box
                className="messages"
                flex="1"
                mb={2}
              >
                <ScrollableChat 
                  messages={messages} 
                  setMessages={setMessages} 
                  onDeleteMessage={(messageId) => {
                    if (socket) {
                      socket.emit("delete message", { messageId, chat: selectedChat, senderId: user._id });
                    }
                  }}
                />
              </Box>
            )}

            {currentSuggestions.length > 0 && (
              <Box display="flex" gap={2} mb={2} overflowX="auto" className="suggestions-container" pl={2} pb={2}>
                {currentSuggestions.map((suggestion, idx) => (
                  <Box
                    key={idx}
                    as="button"
                    bg="white"
                    color="gray.700"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="medium"
                    borderWidth="1px"
                    borderColor="gray.300"
                    _hover={{ bg: "gray.50", transform: "scale(1.02)" }}
                    transition="all 0.2s"
                    onClick={(e) => sendMessage({ type: "click", key: "Enter" }, suggestion)}
                    whiteSpace="nowrap"
                    boxShadow="sm"
                  >
                    {suggestion}
                  </Box>
                ))}
              </Box>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="message-input"
              isRequired
              mt="auto"
            >
              {istyping && (
                <Box width="fit-content" ml={2}>
                  <TypingIndicator />
                </Box>
              )}
              <Box display="flex" gap={3} alignItems="center" bg="#f0f2f5" p={2} borderRadius="xl" borderWidth="1px" borderColor="gray.300" mt={2}>
                <Input
                  variant="unstyled"
                  placeholder={isRecording ? "Recording..." : "Type a message..."}
                  value={newMessage}
                  onChange={typingHandler}
                  px={4}
                  py={2}
                  fontSize={{ base: "sm", md: "md" }}
                  isDisabled={isRecording}
                  _placeholder={{ color: "gray.500" }}
                />
                
                <Flex gap={1} mr={1}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<i className="fas fa-plus"></i>}
                      variant="ghost"
                      color="gray.500"
                      _hover={{ bg: "gray.200", color: "gray.700" }}
                      size="md"
                      isDisabled={mediaLoading || isRecording}
                    />
                    <MenuList color="black">
                      <MenuItem icon={<FaImage />} onClick={() => imageInputRef.current.click()}>
                        Image
                      </MenuItem>
                      <MenuItem icon={<FaVideo />} onClick={() => videoInputRef.current.click()}>
                        Video
                      </MenuItem>
                      <MenuItem icon={<FaHeadphones />} onClick={() => fileInputRef.current.click()}>
                        Audio
                      </MenuItem>
                      <MenuItem 
                        icon={isRecording ? <FaStop /> : <FaMicrophone />} 
                        onClick={isRecording ? stopRecording : startRecording}
                        color={isRecording ? "red.500" : "inherit"}
                      >
                        {isRecording ? "Stop Recording" : "Voice Message"}
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <input
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, "audio")}
                  />
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    ref={videoInputRef}
                    onChange={(e) => handleFileUpload(e, "video")}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={imageInputRef}
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                </Flex>

                <IconButton
                  aria-label={isRecording ? "Stop recording" : "Send message"}
                  icon={mediaLoading ? <Spinner size="xs" /> : (isRecording ? <FaStop /> : <i className="fas fa-paper-plane"></i>)}
                  onClick={() => isRecording ? stopRecording() : sendMessage({ key: "Enter" })}
                  bg={isRecording ? "red.500" : "#25D366"}
                  color="white"
                  borderRadius="full"
                  size="md"
                  transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                  _hover={{ transform: "scale(1.05)", bg: isRecording ? "red.600" : "#1DA851" }}
                  isDisabled={mediaLoading}
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%" flexDir="column" gap={4}>
          <Box boxSize="200px" opacity={0.6} transition="all 0.5s" _hover={{ opacity: 1, transform: "scale(1.05)" }}>
            <i className="fas fa-comments" style={{ fontSize: "150px", color: "#CBD5E0" }}></i>
          </Box>
          <Text
            fontSize={{ base: "xl", md: "3xl" }}
            fontWeight="600"
            fontFamily="Inter"
            textAlign="center"
            px={4}
            color="gray.500"
          >
            Select a conversation to start chatting
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;