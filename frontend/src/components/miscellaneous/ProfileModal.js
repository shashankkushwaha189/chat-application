import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  if (!user) return null;

  return (
    <>
      {children ? (
        <Box as="span" onClick={onOpen} cursor="pointer">
          {children}
        </Box>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} size={{ base: "sm", md: "md" }} />
      )}
      <Modal size={{ base: "sm", md: "lg" }} isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          height={{ base: "auto", md: "410px" }}
          w={{ base: "90%", sm: "95%", md: "100%" }}
          mx="auto"
          borderRadius="lg"
        >
          <ModalHeader
            fontSize={{ base: "28px", md: "40px" }}
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            borderTopRadius="lg"
            isTruncated
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            py={{ base: 4, md: 6 }}
          >
            <Image
              borderRadius="full"
              boxSize={{ base: "120px", md: "150px" }}
              src={user.pic}
              alt={user.name}
              boxShadow="0 4px 15px rgba(0,0,0,0.1)"
              mb={4}
            />
            <Text fontSize={{ base: "16px", md: "30px" }} fontFamily="Work sans" textAlign="center" px={2}>
              <b>Email:</b> {user.email}
            </Text>
          </ModalBody>
          <ModalFooter borderTop="1px solid #e2e8f0" justifyContent="center" py={{ base: 3, md: 4 }}>
            <Button colorScheme="blue" onClick={onClose} w={{ base: "100%", md: "auto" }} fontSize={{ base: "sm", md: "md" }}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
