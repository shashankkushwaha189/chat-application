import { Box, Spinner, useBreakpointValue, Drawer, DrawerOverlay, DrawerContent, useDisclosure } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user, loading } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box w="100%" h="100dvh" display="flex" flexDir="column" overflow="hidden">
      {loading ? <Spinner /> : user ? <SideDrawer onOpenChatList={onOpen} /> : <Navigate to="/" />}
      <Box flex={1} display="flex" w="100%" p={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 2, md: 4 }} overflow="hidden">
        {user && isMobile ? (
          <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay backdropFilter="blur(4px)" />
            <DrawerContent bg="transparent" p={0} boxShadow="none">
              <MyChats fetchAgain={fetchAgain} onClose={onClose} />
            </DrawerContent>
          </Drawer>
        ) : (
          user && <MyChats fetchAgain={fetchAgain} />
        )}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>
    </Box>
  );
};

export default ChatPage;
