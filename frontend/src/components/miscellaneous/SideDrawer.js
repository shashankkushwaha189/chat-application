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
import { getSender } from "../../config/ChatLogics";
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
          fontSize="3xl"
          fontFamily="Inter"
          fontWeight="800"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
        >
          Chat -X
        </Text>
        <div>
          <Menu>
            <MenuButton p={1} position="relative">
              {notification.length > 0 && (
                <Badge
                  colorScheme="red"
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  borderRadius="full"
                  fontSize="0.7em"
                  px={2}
                >
                  {notification.length}
                </Badge>
              )}
              <BellIcon fontSize="2xl" m={1} color="gray.600" _hover={{ color: "purple.500" }} transition="all 0.2s" />
            </MenuButton>
            <MenuList pl={2} borderColor="purple.100" boxShadow="lg" color="black">
              {!notification.length && <MenuItem _hover={{ bg: "transparent" }} cursor="default">No New Messages</MenuItem>}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                  _hover={{ bg: "purple.50" }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />} _hover={{ bg: "purple.50" }}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList borderColor="purple.100" boxShadow="lg">
              <ProfileModal user={user}>
                <MenuItem _hover={{ bg: "purple.50" }}>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} _hover={{ bg: "red.50", color: "red.500" }}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="white" borderRadius="0 20px 20px 0">
          <DrawerHeader borderBottomWidth="1px" borderColor="purple.100" color="purple.700" fontWeight="bold">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2} gap={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                borderRadius="lg"
                borderColor="purple.200"
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
              />
              <Button onClick={handleSearch} colorScheme="purple" borderRadius="lg" px={6}>Go</Button>
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
