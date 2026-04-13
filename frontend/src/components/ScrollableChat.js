import { Avatar, Tooltip, useToast, Menu, MenuButton, MenuList, MenuItem, Box } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import axios from "axios";
import { saveAs } from "file-saver";
import {
  isLastMessage,
  isSameSender,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ScrollableChat = ({ messages, setMessages, onDeleteMessage }) => {
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
      if (onDeleteMessage) {
        onDeleteMessage(messageId);
      }
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

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${ENDPOINT}${url}`;
  };

  const handleDownload = (fileUrl, fileName) => {
    try {
      saveAs(getFullUrl(fileUrl), fileName || "download");
    } catch (error) {
      toast({
        title: "Download Failed",
        status: "error",
        duration: 3000,
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
                <Tooltip label={m.sender?.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="xs"
                    cursor="pointer"
                    name={m.sender?.name}
                    src={m.sender?.pic}
                  />
                </Tooltip>
              ) : (
                <div style={{ width: "24px" }}></div>
              )}
                  <Box
                    style={{
                      backgroundColor: m.sender._id === user._id ? "#d9fdd3" : "white",
                      color: "#111b21",
                      marginLeft: 10,
                      marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                      borderRadius: m.sender._id === user._id ? "8px 0px 8px 8px" : "0px 8px 8px 8px",
                      padding: "8px 12px",
                      fontSize: "15px",
                      fontWeight: "400",
                      lineHeight: "1.4",
                      boxShadow: "0 1px 0.5px rgba(11,20,26,.13)",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minWidth: m.messageType === "video" ? "250px" : "auto",
                      textAlign: "left",
                    }}
                  >
                    {selectedChat.isGroupChat && m.sender._id !== user._id && (
                      (!messages[i - 1] || messages[i - 1].sender._id !== m.sender._id) && (
                        <span style={{ 
                          fontSize: "13px", 
                          fontWeight: "bold", 
                          color: "#128C7E",
                          marginBottom: "4px"
                        }}>
                          {m.sender?.name}
                        </span>
                      )
                    )}

                    {m.messageType === "audio" || m.messageType === "voice" ? (
                      <audio controls src={getFullUrl(m.fileUrl)} style={{ maxHeight: "40px", width: "250px" }} />
                    ) : m.messageType === "video" ? (
                      <video controls src={getFullUrl(m.fileUrl)} style={{ borderRadius: "10px", maxWidth: "100%" }} />
                    ) : m.messageType === "image" ? (
                      <img 
                        src={getFullUrl(m.fileUrl)} 
                        alt="Message" 
                        style={{ borderRadius: "10px", maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }} 
                      />
                    ) : null}

                    <Menu isLazy>
                      <MenuButton
                        as={Box}
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                        width="100%"
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", fontSize: m.messageType !== "text" ? "12px" : "15px", opacity: m.messageType !== "text" ? 0.8 : 1 }}>
                          {m.content}
                          {m.messageType && m.messageType !== "text" && (
                            <span style={{ fontSize: "10px", marginLeft: "10px" }}>▼ options</span>
                          )}
                        </div>
                      </MenuButton>
                      
                      {(m.sender._id === user._id || (m.messageType && m.messageType !== "text")) && (
                        <MenuList color="black">
                          {m.messageType && m.messageType !== "text" && (
                            <MenuItem 
                              icon={<i className="fas fa-download"></i>}
                              onClick={() => handleDownload(m.fileUrl, m.content || "download")}
                            >
                              Download {m.messageType.charAt(0).toUpperCase() + m.messageType.slice(1)}
                            </MenuItem>
                          )}
                          {m.sender._id === user._id && (
                            <MenuItem 
                              icon={<i className="fas fa-trash"></i>} 
                              color="red.500"
                              onClick={() => deleteMessageHandler(m._id)}
                            >
                              Delete Message
                            </MenuItem>
                          )}
                        </MenuList>
                      )}
                    </Menu>
                  </Box>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;