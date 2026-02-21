import { Avatar, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex", flexDirection: "column" }} key={m._id}>
            <div style={{ display: "flex", alignSelf: m.sender._id === user._id ? "flex-end" : "flex-start", maxWidth: "80%" }}>
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
                  transition: "all 0.2s"
                }}
              >
                {m.content}
              </span>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;