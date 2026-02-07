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
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={{ base: 2, md: 3 }}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow={{ base: "none", md: "sm" }}
      overflowY="auto"
    >
      <Box
        pb={3}
        px={{ base: 2, md: 3 }}
        fontSize={{ base: "24px", sm: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "xs", sm: "sm", md: "md", lg: "17px" }}
            rightIcon={<AddIcon />}
            size={{ base: "sm", md: "md" }}
            colorScheme="teal"
            variant="solid"
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={{ base: 2, md: 3 }}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="auto"
        gap={2}
      >
        {chats ? (
          <Stack spacing={2} overflowY="auto">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={{ base: 2, md: 3 }}
                py={{ base: 1.5, md: 2 }}
                borderRadius="lg"
                key={chat._id}
                position="relative"
                transition="all 0.2s ease"
                _hover={{
                  bg: selectedChat === chat ? "#38B2AC" : "#ddd",
                  transform: "translateX(4px)",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex="1" minW={0}>
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: "sm", md: "md" }}
                      isTruncated
                    >
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {chat.latestMessage && (
                      <Text fontSize={{ base: "xs", md: "sm" }} isTruncated opacity={0.7}>
                        <b>{chat.latestMessage.sender.name} : </b>
                        {chat.latestMessage.content.length > 50
                          ? chat.latestMessage.content.substring(0, 50) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                  {getNotificationCount(chat._id) > 0 && (
                    <Badge
                      ml={2}
                      borderRadius="full"
                      px={2}
                      py={1}
                      colorScheme="red"
                      fontSize={{ base: "0.65em", md: "0.8em" }}
                      flexShrink={0}
                    >
                      {getNotificationCount(chat._id)}
                    </Badge>
                  )}
                </Box>
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