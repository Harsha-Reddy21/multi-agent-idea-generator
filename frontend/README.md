# Smart Product Profile

A modern React application for managing product profiles with an integrated AI assistant panel. Built with TypeScript, Vite, and designed for optimal user experience with responsive layout and expandable panels.

## Features

### 🎯 Core Features
- **Rich Text Editor**: Full-featured text editor with formatting toolbar (bold, italic, underline, lists, links, media)
- **AI Assistant Panel**: Interactive AI chat panel with confidence score and real-time responses
- **Expandable/Collapsible Panels**: Toggle between full-width editor and AI panel views
- **Modern UI Design**: Clean, professional interface matching the provided design specification
- **Responsive Layout**: Works seamlessly across different screen sizes

### 🎨 UI Components
- **Header**: Navigation with logo, product menu, and action buttons
- **Text Editor**: Document editor with tabs and formatting options
- **AI Agent**: Chat interface with confidence score display and message history
- **Layout System**: Flexible grid layout with smooth panel transitions

### 💡 Technical Highlights
- **Type-Safe**: Full TypeScript support for better code quality
- **Performance Optimized**: Built with Vite for fast development and production builds
- **Modular Architecture**: Separated components, styles, and utilities
- **Modern React**: Using functional components with hooks

## Project Structure

```
src/
├── components/
│   ├── Header.tsx           # Header with navigation
│   ├── TextEditor.tsx       # Rich text editor component
│   └── AIAgent.tsx          # AI assistant panel
├── styles/
│   ├── app.css              # Main layout styles
│   ├── header.css           # Header component styles
│   ├── text-editor.css      # Editor component styles
│   └── ai-agent.css         # AI panel component styles
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── contentParser.ts     # Content parsing utilities
├── App.tsx                  # Main application component
├── main.tsx                 # Entry point
└── index.css               # Global styles
```

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

### Development

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Usage Guide

### Text Editor
- **Edit Title**: Click on the product name to edit it
- **Format Text**: Use the toolbar buttons to apply formatting
- **Tabs**: Switch between Overview and Details views
- **Content**: Type or paste content directly into the editor area
- **Collapse**: Click the collapse button (◀) to expand the AI panel

### AI Assistant Panel
- **Confidence Score**: Shows AI prediction confidence (0-100%)
- **Chat Interface**: View message history and conversation with AI
- **Send Message**: Type your question and press Enter or click the send button
- **Expand**: Click the collapse button (▶) to expand the editor
- **Messages**: Automatic responses from the AI assistant

### Layout Modes

The application supports three layout modes that can be toggled:

1. **Full View** (Default): Both editor and AI panel visible side-by-side
   - Editor: 60% width
   - AI Panel: 40% width

2. **Editor Expanded**: Full-width text editor
   - Click the collapse button (◀) in the editor to activate
   - Hides the AI panel

3. **AI Expanded**: Full-width AI assistant
   - Click the collapse button (▶) in the AI panel to activate
   - Hides the text editor

## Configuration

### Customize Colors
Edit the CSS files in `src/styles/` to modify colors:
- Primary red: `#d32f2f`
- Text color: `#1a1a1a`
- Background: `#ffffff` (editor), `#f8f9fa` (AI panel)

### Modify Content
- Default content is in `src/utils/contentParser.ts`
- Update text and placeholder content in the component files

### API Integration
To connect to a real AI service:
1. Update the `handleSendMessage` function in `src/components/AIAgent.tsx`
2. Replace the simulated response with actual API calls
3. Update TypeScript types in `src/types/index.ts` as needed

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check
npm run check

# Lint (if ESLint is configured)
npm run lint
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- **Code Splitting**: Automatic with Vite
- **CSS Optimization**: Minified and compressed in production
- **Tree Shaking**: Unused code is removed in production builds
- **Fast Refresh**: Instant updates during development

## Future Enhancements

- [ ] Real AI integration with backend API
- [ ] Local storage for draft saving
- [ ] Export to PDF/Word
- [ ] Collaborative editing
- [ ] User authentication
- [ ] Dark mode support
- [ ] Advanced search and filtering

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue or contact the development team.
