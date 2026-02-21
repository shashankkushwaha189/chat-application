import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, useToast, Button, Badge } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
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
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={{ base: 3, md: 4 }}
      bg="rgba(255, 255, 255, 0.9)"
      backdropFilter="blur(10px)"
      w={{ base: "100%", md: "31%" }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="purple.100"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
      overflowY="hidden"
    >
      <Box
        pb={4}
        px={3}
        fontSize={{ base: "24px", md: "30px" }}
        fontFamily="Inter"
        fontWeight="bold"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="purple.700"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "14px", md: "16px", lg: "17px" }}
            rightIcon={<AddIcon />}
            bgGradient="linear(to-r, purple.500, pink.500)"
            color="white"
            _hover={{ 
              bgGradient: "linear(to-r, purple.600, pink.600)",
              transform: "scale(1.05)" 
            }}
            transition="all 0.2s"
            borderRadius="lg"
            size="sm"
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="xl"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll" spacing={3}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "purple.500" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={4}
                py={3}
                borderRadius="xl"
                key={chat._id}
                transition="all 0.2s"
                boxShadow={selectedChat === chat ? "0 4px 12px rgba(128, 90, 213, 0.3)" : "none"}
                _hover={{
                  bg: selectedChat === chat ? "purple.600" : "#DEDEDE",
                  transform: "translateX(5px)"
                }}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Text fontWeight="600" fontSize="md">
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs" mt={1} opacity={selectedChat === chat ? 0.9 : 0.7}>
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
                {getNotificationCount(chat._id) > 0 && (
                  <Badge colorScheme="red" borderRadius="full" px={2} fontSize="0.8em">
                    {getNotificationCount(chat._id)}
                  </Badge>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;