/**
 * Application-wide constants
 */

// Text editor constants
export const EDITOR_LINE_HEIGHT = 24;
export const EDITOR_MAX_LINES = 5;
export const EDITOR_MAX_HEIGHT = EDITOR_LINE_HEIGHT * EDITOR_MAX_LINES;

// File upload constants
export const MAX_FILES = 3;
export const ALLOWED_FILE_EXTENSIONS = [".docx", ".txt", ".pdf", ".png", ".jpg", ".jpeg"];

// AI Agent constants
export const AI_RESPONSE_DELAY = 800;
export const COPY_FEEDBACK_DURATION = 2000;

// Diff viewer constants
export const DIFF_CONTEXT_LINES = 3;

// Confidence score constants
export const CONFIDENCE_THRESHOLD = 80;

// Initial welcome messages
export const INITIAL_MESSAGES = [
  {
    id: "1",
    role: "assistant" as const,
    content:
      "👋 **Welcome to Smart Product Profile!**\n\nHow can I assist you today?\n\nTry asking me to:\n- `improve` your content\n- Show `feature` suggestions\n- `change` or `rewrite` text\n- Display an `image` preview",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "user" as const,
    content: "Will third parties be accessing this tool?",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "3",
    role: "assistant" as const,
    content:
      "**No.** This tool will only be for *Lilly employees* and use their existing Lilly accounts to log in. Secure authentication✅ Internal use only",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "4",
    role: "user" as const,
    content:
      "I've written a paragraph about Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    timestamp: new Date(),
  },
];

// Dummy AI responses
export const DUMMY_RESPONSES: Record<string, string> = {
  improve:
    "Great question! Here are some suggestions to **improve** your product description:\n\n1. Add specific benefits and use cases\n2. Include quantifiable metrics or data\n3. Highlight what makes your product unique\n4. Use `clear, concise` language\n5. Consider adding customer testimonials\n\n> Would you like me to expand on any of these suggestions?",

  feature:
    "Your product description should clearly highlight:\n\n- **Core features** and functionality\n- **Key benefits** for the user\n- **Target audience**\n- **Pricing** or value proposition\n- How it **solves customer problems**\n\nMake sure each feature is explained in terms of user benefits!",

  tone: 'Based on your current content, I\'d recommend:\n\n• Use a professional yet approachable tone\n• Avoid overly technical jargon for general audiences\n• Use active voice (e.g., "Transform your workflow" instead of "Your workflow will be transformed")\n• Be specific about benefits rather than vague claims\n\nThis will make your product more appealing to potential customers.',

  grammar:
    "Your content looks good from a grammar perspective! A few tips:\n\n• Keep sentences concise (15-20 words)\n• Use short paragraphs (2-3 sentences)\n• Break up longer sections with bullet points\n• Ensure consistent tense throughout\n• Proofread for typos and formatting\n\nConsistency and clarity are key!",

  change: JSON.stringify({
    type: "change",
    change: {
      old_msg: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      new_msg:
        "**Lorem ipsum** is a sophisticated placeholder text widely utilized across *graphic design*, publishing, and web development industries.\n\nIt enables designers to create page layouts without being distracted by meaningful content.",
    },
  }),

  image: JSON.stringify({
    type: "image",
    image: {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQykzoZeCE0p7LeuyHnLYCdPP2jju9d5PaMeA&s",
      alt: "Product Preview Image",
    },
  }),

  gif: JSON.stringify({
    type: "image",
    image: {
      url: "/src/assets/grabill54-gift-9817.gif",
      alt: "Local GIF Preview",
    },
  }),

  rewrite: `<h2>General Information</h2>
<p>Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing, and web development. Its purpose is to permit a page layout to be designed, independently of the copy that will subsequently populate it, or to demonstrate various fonts of a typeface without meaningful text that could be distracting.</p>
 
<p>Lorem ipsum is typically a corrupted version of De finibus bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and removed to make it nonsensical and improper Latin. The first two words are the truncation of dolorem ipsum ("pain itself").</p>
 
<h2>Data Information</h2>
<p>Versions of the Lorem ipsum text have been used in typesetting since the 1960s, when advertisements for Letraset transfer sheets popularized it. Lorem ipsum was introduced to the digital world in the mid-1980s, when Aldus employed it in graphic and word-processing templates for its desktop publishing program PageMaker.</p>
 
<h2>Legal Information</h2>
<p>Lorem dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
 
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,

  default:
    "That's an excellent point! Here's my feedback:\n\nYour product description has a solid foundation. To make it even better:\n\n1. **Be More Specific** - Add concrete examples and use cases\n2. **Highlight Unique Value** - What sets this product apart?\n3. **Focus on Benefits** - How does this solve customer problems?\n4. **Improve Clarity** - Simplify complex concepts\n5. **Add Social Proof** - Include customer testimonials or case studies\n\nWould you like me to suggest changes for any specific section?",
};
