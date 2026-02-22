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
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const file = new File([audioBlob], "voice_message.wav", { type: "audio/wav" });
        
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
      setIsRecording(false);
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
            bg="rgba(240, 242, 245, 0.8)"
            backdropFilter="blur(5px)"
            w="100%"
            flex="1"
            borderRadius="2xl"
            overflow="hidden"
            overflowX="hidden"
            borderWidth="0"
            borderColor="transparent"
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
              {istyping && (
                <Box width="fit-content" ml={2}>
                  <TypingIndicator />
                </Box>
              )}
              <Box display="flex" gap={2} alignItems="center" bg="white" p={2} borderRadius="xl" boxShadow="sm">
                <Input
                  variant="unstyled"
                  placeholder={isRecording ? "Recording..." : "Type a message..."}
                  value={newMessage}
                  onChange={typingHandler}
                  px={4}
                  fontSize={{ base: "sm", md: "md" }}
                  isDisabled={isRecording}
                />
                
                <Flex gap={1} mr={1}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<i className="fas fa-plus"></i>}
                      variant="ghost"
                      colorScheme="purple"
                      size="sm"
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
                  aria-label="Send message"
                  icon={mediaLoading ? <Spinner size="xs" /> : <i className="fas fa-paper-plane"></i>}
                  onClick={() => sendMessage({ key: "Enter" })}
                  colorScheme="purple"
                  borderRadius="lg"
                  size="md"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.1)" }}
                  isDisabled={mediaLoading || isRecording}
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