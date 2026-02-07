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
        bg="#E8E8E8"
        _hover={{ background: "#38B2AC", color: "white", transform: "translateX(2px)" }}
        w="100%"
        d="flex"
        alignItems="center"
        color="black"
        px={{ base: 2, md: 3 }}
        py={{ base: 1.5, md: 2 }}
        mb={2}
        borderRadius="lg"
        transition="all 0.2s ease"
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