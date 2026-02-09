/**
 * AI response generation utility
 */

import { DUMMY_RESPONSES } from "../constants";

/**
 * Generate a dummy AI response based on user input keywords
 */
export const generateDummyResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  // Check which keyword matches the user input
  for (const [keyword, response] of Object.entries(DUMMY_RESPONSES)) {
    if (keyword !== "default" && lowerMessage.includes(keyword)) {
      return response;
    }
  }

  return DUMMY_RESPONSES.default;
};
