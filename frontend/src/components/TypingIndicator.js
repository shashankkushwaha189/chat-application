import React from 'react';
import { Box } from '@chakra-ui/react';
import './styles.css';

const TypingIndicator = () => {
  return (
    <Box className="typing-indicator" mt={2} mb={2}>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
    </Box>
  );
};

export default TypingIndicator;
