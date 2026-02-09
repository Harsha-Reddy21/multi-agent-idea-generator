# Quick Start Guide - Smart Product Profile

Get up and running with Smart Product Profile in 5 minutes!

## Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** (optional, for cloning)

## Installation (5 minutes)

### Step 1: Navigate to Project Directory
```bash
cd c:\Users\AtulRameshwarChauhan\smart-product-profile
```

### Step 2: Install Dependencies
```bash
npm install
```
*This installs all required packages (takes 1-2 minutes)*

### Step 3: Start Development Server
```bash
npm run dev
```

You'll see:
```
  VITE v5.4.21  ready in 515 ms
  ➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser
Click on `http://localhost:5173/` or paste it into your browser

**You're done! The application is now running.** 🎉

## First Time Usage

### 1. Edit Product Name
- Click on "Untitled Product" at the top
- Type your product name
- Click elsewhere to save

### 2. Write Product Description
- Click in the large text area
- Start typing your product description
- Use the toolbar buttons for formatting (Bold, Italic, etc.)

### 3. Use AI Assistant
- Scroll down on the right panel
- Type a question in "How can I help?" field
- Press Enter to send
- AI will respond with suggestions

### 4. Expand/Collapse Panels
- Click ◀ in editor to expand text editor to full width
- Click ▶ in AI panel to expand AI assistant to full width
- Click again to return to split view

## Common Commands

### Development
```bash
npm run dev          # Start development server (HMR enabled)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Maintenance
```bash
npm install          # Install dependencies
npm audit            # Check for security vulnerabilities
npm update           # Update all packages
npm ci               # Clean install (recommended for CI/CD)
```

## Project Structure

```
smart-product-profile/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── TextEditor.tsx
│   │   └── AIAgent.tsx
│   ├── styles/              # Component styles
│   │   ├── app.css
│   │   ├── header.css
│   │   ├── text-editor.css
│   │   └── ai-agent.css
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── contentParser.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── README.md                # Full documentation
├── FEATURES.md              # Feature guide
├── DEPLOYMENT.md            # Deployment guide
└── package.json             # Dependencies
```

## Key Features at a Glance

| Feature | How to Use |
|---------|-----------|
| **Edit Title** | Click on product name |
| **Format Text** | Use toolbar buttons (B, I, U, etc.) |
| **Add Lists** | Click bullet (•) or number (1.) buttons |
| **AI Chat** | Type in right panel input field |
| **Expand Editor** | Click ◀ button in editor header |
| **Expand AI Panel** | Click ▶ button in AI panel header |
| **Change Tabs** | Click Overview/Details buttons |
| **Submit for Review** | Click red "Submit for review" button |

## Useful Tips

### 💡 Editor Tips
- Select text before applying formatting
- Use Shift+Enter for line breaks in text
- Your content is automatically displayed as you type

### 💡 AI Tips
- Be specific in your questions
- Ask for suggestions on specific sections
- Check the confidence score for content quality assessment
- The AI provides instant feedback on your descriptions

### 💡 Layout Tips
- Use expanded view when writing
- Use AI expanded view for getting detailed feedback
- Split view is great for comparing editor and AI suggestions

## Troubleshooting

### Application won't start
```bash
# Clear cache and try again
rm -rf node_modules dist
npm install
npm run dev
```

### Port 5173 is already in use
```bash
# Use a different port
npm run dev -- --port 5174
```

### Changes not reflecting in browser
- Press `Ctrl+Shift+R` (hard refresh)
- Check browser console for errors (F12)

### Build fails
```bash
npm run build  # See detailed error messages
```

## Next Steps

1. **Customize Content**
   - Replace placeholder text with your product info
   - Use AI suggestions to improve descriptions

2. **Learn Features**
   - Read [FEATURES.md](./FEATURES.md) for detailed feature guide
   - Explore all formatting options in the toolbar

3. **Deploy**
   - When ready, follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Vercel, Netlify, or other platforms

4. **Development**
   - Check [README.md](./README.md) for full documentation
   - Review [.github/copilot-instructions.md](./.github/copilot-instructions.md) for development guidelines

## Getting Help

- **Features & Usage**: See [FEATURES.md](./FEATURES.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Development**: See [.github/copilot-instructions.md](./.github/copilot-instructions.md)
- **Full Docs**: See [README.md](./README.md)

## Development Commands Explained

```bash
npm run dev
# Starts a local development server with hot reload
# Changes save automatically and refresh in browser

npm run build
# Creates an optimized production build in 'dist' folder
# Minifies code and assets for best performance

npm run preview
# Previews the production build locally
# Run this AFTER 'npm run build' to test the final version
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Page loads in ~1 second (dev)
- Response to user input: <100ms
- AI panel updates in real-time
- Optimized CSS and JavaScript bundles

## What's Included

✅ React 18.3.1
✅ TypeScript 5.2.2
✅ Vite 5.4.21 (fast build tool)
✅ Modern UI design
✅ Responsive layout
✅ Expandable panels
✅ Rich text editor
✅ AI assistant integration ready

## Need More Info?

- Full documentation: [README.md](./README.md)
- Feature guide: [FEATURES.md](./FEATURES.md)
- Deployment options: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Development guide: [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

**Happy coding!** 🚀

For questions or issues, refer to the documentation files or create an issue in the repository.
