import React from 'react'
import { Avatar, Box, Text } from '@chakra-ui/react';

const UserListItem = ({ user, handleFunction }) => {
    
  return (
    <Box
        role="button"
        tabIndex={0}
        onClick={handleFunction}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFunction(); }}
        cursor="pointer"
        bg="white"
        _hover={{ 
          background: "purple.500", 
          color: "white", 
          transform: "translateX(4px)",
          boxShadow: "0 4px 12px rgba(128, 90, 213, 0.3)"
        }}
        w="100%"
        d="flex"
        alignItems="center"
        color="black"
        px={{ base: 2, md: 3 }}
        py={{ base: 1.5, md: 2 }}
        mb={2}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.100"
        transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
    >
        <Avatar 
        mr={3}
        size={{ base: "sm", md: "md" }}
        cursor="pointer"
        name={user.name}
        src={user.pic}
        />
        <Box flex={1} minW={0}>
        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} isTruncated>
            {user.name}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} isTruncated>
            <b>Email : </b>
            {user.email}
        </Text>
        </Box>

    </Box>
  )
}

export default UserListItem