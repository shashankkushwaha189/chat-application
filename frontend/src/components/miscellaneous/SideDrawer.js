import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";

import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";

const SideDrawer = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
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
      const { data } = await axios.get(`/api/user?search=${encodeURIComponent(search)}`, config);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to access chat",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        w="100%"
        p={{ base: "8px 10px", md: "10px 15px" }}
        borderWidth="0"
        boxShadow="md"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            variant="ghost"
            onClick={onOpen}
            leftIcon={<i className="fas fa-search"></i>}
            color="white"
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
            fontSize={{ base: "sm", md: "md" }}
            size={{ base: "sm", md: "md" }}
          >
            <Text display={{ base: "none", md: "flex" }} ml={2}>
              Search
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize={{ base: "xl", sm: "2xl", md: "2xl" }}
          color="white"
          fontFamily="Work sans"
          fontWeight="bold"
          textAlign="center"
          flex={1}
        >
          Chat -X
        </Text>
        <Box display="flex" gap={2} alignItems="center">
          <Menu>
            <MenuButton p={1} position="relative">
              <BellIcon fontSize={{ base: "lg", md: "2xl" }} color="white" />
              {notification.length > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  borderRadius="full"
                  colorScheme="red"
                  fontSize={{ base: "0.6em", md: "0.8em" }}
                  fontWeight="bold"
                >
                  {notification.length}
                </Badge>
              )}
            </MenuButton>
            {notification.length > 0 && (
              <MenuList maxH="300px" overflowY="auto">
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n._id !== notif._id));
                    }}
                  >
                    <Text fontSize={{ base: "xs", md: "sm" }}>
                      {notif.chat.isGroupChat
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from ${notif.sender.name}`}
                    </Text>
                  </MenuItem>
                ))}
              </MenuList>
            )}
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.2)" }}>
              <Avatar
                size={{ base: "xs", md: "sm" }}
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} color="red.500">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size={{ base: "full", sm: "sm" }}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader
            borderBottomWidth="1px"
            fontSize={{ base: "lg", md: "xl" }}
            bgGradient="linear(to-r, #667eea, #764ba2)"
            color="white"
          >
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={3} gap={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="lg"
                size={{ base: "sm", md: "md" }}
                _placeholder={{ color: "#a0aec0" }}
              />
              <Button
                onClick={handleSearch}
                colorScheme="teal"
                isLoading={loading}
                size={{ base: "sm", md: "md" }}
              >
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
