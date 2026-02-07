import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={{ base: 1.5, md: 2 }}
      py={{ base: 0.5, md: 1 }}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={{ base: "10px", md: "12px" }}
      colorScheme="purple"
      cursor="pointer"
      onClick={handleFunction}
      transition="all 0.2s ease"
      _hover={{ shadow: "md", transform: "scale(1.05)" }}
    >
      {user.name}
      {admin === user._id && <span> (Admin)</span>}
      <CloseIcon pl={1} />
    </Badge>
  );
};

export default UserBadgeItem;