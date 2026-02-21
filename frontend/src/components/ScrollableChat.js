import { Avatar, Tooltip, useToast, Menu, MenuButton, MenuList, MenuItem, Box } from "@chakra-ui/react";
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
  const { user, selectedChat } = ChatState();
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
                <Menu isLazy>
                  <MenuButton
                    as={Box}
                    _focus={{ boxShadow: "none" }}
                    _active={{ bg: "transparent" }}
                    border="none"
                    style={{
                      backgroundColor: m.sender._id === user._id ? "#805AD5" : "white",
                      color: m.sender._id === user._id ? "white" : "black",
                      marginLeft: 10,
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                      borderRadius: m.sender._id === user._id ? "20px 20px 0px 20px" : "20px 20px 20px 0px",
                      padding: "8px 16px",
                      fontSize: "15px",
                      fontWeight: "400",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      minWidth: m.messageType === "video" ? "250px" : "auto",
                      cursor: "pointer",
                      textAlign: "left",
                      boxShadow: "none"
                    }}
                  >
                    {selectedChat.isGroupChat && m.sender._id !== user._id && (
                      (!messages[i - 1] || messages[i - 1].sender._id !== m.sender._id) && (
                        <span style={{ 
                          fontSize: "12px", 
                          fontWeight: "bold", 
                          color: "#805AD5",
                          marginBottom: "4px"
                        }}>
                          {m.sender.name}
                        </span>
                      )
                    )}
                    {m.messageType === "text" || !m.messageType ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {m.content}
                      </div>
                    ) : m.messageType === "audio" || m.messageType === "voice" ? (
                      <audio controls style={{ maxHeight: "40px" }}>
                        <source src={`${m.fileUrl}`} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    ) : m.messageType === "video" ? (
                      <video controls style={{ borderRadius: "10px", maxWidth: "100%" }}>
                        <source src={`${m.fileUrl}`} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    ) : m.messageType === "image" ? (
                      <img 
                        src={`${m.fileUrl}`} 
                        alt="Message" 
                        style={{ borderRadius: "10px", maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }} 
                      />
                    ) : null}
                  </MenuButton>
                  {m.sender._id === user._id && (
                    <MenuList color="black">
                      <MenuItem 
                        icon={<i className="fas fa-trash"></i>} 
                        color="red.500"
                        onClick={() => deleteMessageHandler(m._id)}
                      >
                        Delete Message
                      </MenuItem>
                    </MenuList>
                  )}
                </Menu>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;