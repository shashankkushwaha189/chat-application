import { Avatar, Tooltip, IconButton, useToast } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import axios from "axios";
import {
  isLastMessage,
  isSameSender,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages, setMessages }) => {
  const { user } = ChatState();
  const toast = useToast();

  const deleteMessageHandler = async (messageId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`/api/message/${messageId}`, config);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast({
        title: "Message Deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to delete the message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div 
            style={{ display: "flex", flexDirection: "column" }} 
            key={m._id}
          >
            <div 
              className="message-row"
              style={{ 
                display: "flex", 
                alignSelf: m.sender._id === user._id ? "flex-end" : "flex-start", 
                maxWidth: "80%",
                position: "relative",
                group: "true"
              }}
            >
              {isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id) ? (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="xs"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              ) : (
                <div style={{ width: "24px" }}></div>
              )}
              <span
                style={{
                  backgroundColor: m.sender._id === user._id ? "#805AD5" : "white",
                  color: m.sender._id === user._id ? "white" : "black",
                  marginLeft: 10,
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: m.sender._id === user._id ? "20px 20px 0px 20px" : "20px 20px 20px 0px",
                  padding: "8px 16px",
                  fontSize: "15px",
                  fontWeight: "400",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {m.content}
                {m.sender._id === user._id && (
                  <IconButton
                    aria-label="Delete message"
                    icon={<i className="fas fa-trash"></i>}
                    size="xs"
                    variant="ghost"
                    color="whiteAlpha.700"
                    _hover={{ color: "red.300", bg: "transparent" }}
                    onClick={() => deleteMessageHandler(m._id)}
                    ml={1}
                  />
                )}
              </span>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;