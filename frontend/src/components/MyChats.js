import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, useToast, Button, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Flex } from "@chakra-ui/react";
import { FaUser, FaUsers } from "react-icons/fa";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain, onClose }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats, notification } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const getNotificationCount = (chatId) => {
    return notification.filter((notif) => notif.chat._id === chatId).length;
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display="flex"
      flexDir="column"
      alignItems="center"
      p={{ base: 3, md: 4 }}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      overflowY="hidden"
    >
      <Box
        pb={4}
        px={3}
        fontSize={{ base: "24px", md: "28px" }}
        fontFamily="Inter"
        fontWeight="600"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="black"
      >
        Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "14px", md: "15px" }}
            rightIcon={<AddIcon />}
            bg="#25D366"
            color="white"
            _hover={{ bg: "#1DA851" }}
            borderRadius="md"
            size="sm"
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={0}
        bg="transparent"
        w="100%"
        h="100%"
        borderRadius="xl"
        overflowY="hidden"
      >
        <Tabs variant="enclosed" colorScheme="green" isFitted w="100%" h="100%" display="flex" flexDir="column">
          <TabList mb="1em" px={3} pt={2} borderBottom="1px solid" borderColor="gray.200">
            <Tab _selected={{ color: "#25D366", borderColor: "gray.200", borderBottomColor: "white" }} fontSize="sm" fontWeight="600">Personal</Tab>
            <Tab _selected={{ color: "#25D366", borderColor: "gray.200", borderBottomColor: "white" }} fontSize="sm" fontWeight="600">Groups</Tab>
          </TabList>
          <TabPanels flex={1} overflowY="hidden">
            <TabPanel p={0} h="100%">
              {chats ? (
                <Stack overflowY="scroll" h="100%" spacing={3} px={3} pb={4} className="messages-container">
                  {chats.filter(c => !c.isGroupChat).map((chat) => (
                    <ChatListItem 
                      key={chat._id} 
                      chat={chat} 
                      selectedChat={selectedChat} 
                      setSelectedChat={setSelectedChat}
                      loggedUser={loggedUser}
                      getNotificationCount={getNotificationCount}
                      onClose={onClose}
                    />
                  ))}
                  {chats.filter(c => !c.isGroupChat).length === 0 && (
                    <Text textAlign="center" color="gray.500" mt={10}>No personal chats yet</Text>
                  )}
                </Stack>
              ) : (
                <ChatLoading />
              )}
            </TabPanel>
            <TabPanel p={0} h="100%">
              {chats ? (
                <Stack overflowY="scroll" h="100%" spacing={3} px={3} pb={4} className="messages-container">
                  {chats.filter(c => c.isGroupChat).map((chat) => (
                    <ChatListItem 
                      key={chat._id} 
                      chat={chat} 
                      selectedChat={selectedChat} 
                      setSelectedChat={setSelectedChat}
                      loggedUser={loggedUser}
                      getNotificationCount={getNotificationCount}
                      onClose={onClose}
                    />
                  ))}
                  {chats.filter(c => c.isGroupChat).length === 0 && (
                    <Text textAlign="center" color="gray.500" mt={10}>No group chats yet</Text>
                  )}
                </Stack>
              ) : (
                <ChatLoading />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

const ChatListItem = ({ chat, selectedChat, setSelectedChat, loggedUser, getNotificationCount, onClose }) => {
  return (
    <Box
      onClick={() => {
        setSelectedChat(chat);
        if (onClose) onClose();
      }}
      cursor="pointer"
      bg={selectedChat === chat ? "#e9edef" : "white"}
      color="black"
      px={4}
      py={3}
      borderBottomWidth="1px"
      borderColor="gray.100"
      _hover={{
        bg: "#f5f6f6",
      }}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex alignItems="center" gap={3}>
        <Box 
          p={2} 
          borderRadius="full" 
          bg="gray.100"
          color="gray.600"
        >
          {chat.isGroupChat ? <FaUsers size={18} /> : <FaUser size={18} />}
        </Box>
        <Box>
          <Text fontWeight="700" fontSize="md" letterSpacing="tight">
            {!chat.isGroupChat
              ? getSender(loggedUser, chat.users)
              : chat.chatName}
          </Text>
          {chat.latestMessage && (
            <Text fontSize="xs" mt={1} opacity={selectedChat === chat ? 0.9 : 0.7} isTruncated maxW="200px">
              <b>{chat.latestMessage.sender?.name === loggedUser?.name ? "You" : chat.latestMessage.sender?.name}: </b>
              {chat.latestMessage.messageType === "text" || !chat.latestMessage.messageType 
                ? (chat.latestMessage.content.length > 50
                  ? chat.latestMessage.content.substring(0, 51) + "..."
                  : chat.latestMessage.content)
                : chat.latestMessage.messageType.charAt(0).toUpperCase() + chat.latestMessage.messageType.slice(1)}
            </Text>
          )}
        </Box>
      </Flex>
      {getNotificationCount(chat._id) > 0 && (
        <Badge colorScheme="red" borderRadius="full" px={2} fontSize="0.8em">
          {getNotificationCount(chat._id)}
        </Badge>
      )}
    </Box>
  );
};

export default MyChats;