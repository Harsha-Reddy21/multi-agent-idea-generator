# Smart Product Profile - Features & User Guide

## Table of Contents
1. [Overview](#overview)
2. [User Interface Features](#user-interface-features)
3. [Text Editor Features](#text-editor-features)
4. [AI Assistant Features](#ai-assistant-features)
5. [Layout & Navigation](#layout--navigation)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Tips & Tricks](#tips--tricks)

## Overview

Smart Product Profile is a comprehensive tool for creating and managing product profiles with integrated AI assistance. The application combines professional text editing with intelligent AI suggestions to help you create better product documentation.

### Key Benefits
- **Efficient Writing**: Focus on content while the AI provides real-time suggestions
- **Professional Output**: Built-in formatting and styling options
- **Flexible Layout**: Customize your workspace to your preference
- **Real-time Feedback**: Confidence scoring helps measure content quality

## User Interface Features

### Header Section

Located at the top of the application:

| Element | Function |
|---------|----------|
| **Lilly Logo** | Company branding |
| **Navigation Tabs** | Switch between Overview and Details views |
| **New Product** | Create a new product profile |
| **My Products** | Access list of all products |
| **Submit for Review** | Submit your product for review (red button) |

### Main Layout

The application provides a split-panel layout:

```
┌──────────────────────────────────────────────────┐
│              Header Section                       │
├───────────────────────┬──────────────────────────┤
│                       │                          │
│  Text Editor Panel    │   AI Assistant Panel     │
│  (60% width)          │   (40% width)            │
│                       │                          │
│                       │   - Confidence Score    │
│  - Title Input        │   - Chat Messages       │
│  - Formatting         │   - Input Field         │
│  - Content Area       │                          │
│                       │                          │
└───────────────────────┴──────────────────────────┘
```

## Text Editor Features

### Title Editing
- **Click to Edit**: Click on the product name to edit it
- **Visual Feedback**: Background highlight appears on focus
- **Character Limit**: No strict limit, but keep it concise (recommended: 50 characters)

### Formatting Toolbar

The toolbar provides quick access to formatting options:

#### Text Formatting
- **Bold (B)**: Make text bold
- **Italic (I)**: Make text italic
- **Underline (U)**: Underline text
- **Font Size (AA)**: Change text size

#### List & Structure
- **Bullet List (•)**: Create unordered lists
- **Numbered List (1.)**: Create ordered lists
- **Quote (❝)**: Format as quote
- **Decrease Indent (↤)**: Reduce indentation

#### Media & Links
- **Link (🔗)**: Insert hyperlinks
- **Image (🖼️)**: Embed images
- **File (📎)**: Attach documents
- **Mention (@)**: Mention collaborators

### Tab Navigation
- **Overview**: General information tab
- **Details**: Detailed specifications tab

### Content Area
- **Placeholder Text**: "Start typing..." guide text
- **Auto-scrolling**: Content scrolls as you type
- **Smooth Scrolling**: Vertical scrollbar with custom styling
- **Word Wrap**: Text automatically wraps to next line

## AI Assistant Features

### Confidence Score

The confidence score indicator shows the AI's assessment of your product description:

- **80-100%**: Excellent content quality
- **60-79%**: Good content with minor improvements needed
- **40-59%**: Average content that needs enhancement
- **0-39%**: Content needs significant revision

**Visual Indicator**:
```
Confidence score: 80%
████████░░ [red progress bar]
```

### Chat Interface

#### Message Display
- **User Messages**: Light blue background, right-aligned
- **AI Messages**: White background with border, left-aligned
- **Timestamps**: Each message includes timestamp
- **Message History**: Scroll to view previous conversations

#### Sample Conversation
```
User: "Help me improve this product description"
AI: "Here are suggestions for improvement:
    1. Add specific benefits
    2. Include target audience
    3. Highlight unique features"
```

### Message Input

#### Sending Messages
- **Type**: Click in the input field and type your message
- **Send**: Press Enter or click the send button (↑)
- **Multi-line**: Hold Shift + Enter for multiple lines
- **Disabled State**: Send button is disabled when input is empty

#### Input Features
- **Placeholder**: "Type your question..." guides users
- **Hint Text**: "How can I help?" appears above input
- **Character Limit**: No strict limit (recommended: 500 characters)

### AI Disclaimer
"AI-generated responses may contain errors. Always verify accuracy."

## Layout & Navigation

### Expanding & Collapsing Panels

The application supports dynamic panel resizing:

#### Default View (Full Layout)
```
[Editor: 60%] | [AI Panel: 40%]
```
**How to Use**: Both panels visible simultaneously

#### Editor Expanded
```
[Editor: 100%] ◀ [AI Panel hidden]
```
**How to Activate**: Click the collapse button (◀) in the editor header
**Use Case**: When you need full-width editing space

#### AI Expanded
```
[Editor hidden] ▶ [AI Panel: 100%]
```
**How to Activate**: Click the collapse button (▶) in the AI panel header
**Use Case**: When you need to focus on AI feedback

### Toggle Between Modes
```
Full Layout ↔ Editor Expanded ↔ AI Expanded
```

**Visual Indicators**:
- Collapse buttons show arrow direction
- Panel width smoothly transitions over 0.3 seconds
- Border visibility changes indicate hidden panels

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold text (toolbar) |
| `Ctrl+I` | Italic text (toolbar) |
| `Ctrl+U` | Underline text (toolbar) |
| `Enter` | Send AI message |
| `Shift+Enter` | New line in AI input |
| `Tab` | Switch between panels (if in full view) |

## Tips & Tricks

### Writing Better Product Descriptions

1. **Structure Your Content**
   - Use clear headings for sections
   - Break long paragraphs into smaller chunks
   - Use lists for features and benefits

2. **Include Key Information**
   - Product overview
   - Main features and benefits
   - Target audience
   - Use cases
   - Pricing (if applicable)
   - Support and documentation links

3. **Use AI Feedback**
   - Ask the AI for specific improvements
   - Request rephrasing of complex sentences
   - Get suggestions for missing information
   - Ask for tone and style adjustments

### Optimizing Your Workspace

1. **Use Expanded Views**
   - Expand editor for intensive writing
   - Expand AI panel for getting feedback

2. **Reference Multiple Sections**
   - Use Overview for general info
   - Use Details for technical specifications

3. **Organize with Lists**
   - Bullet lists for features
   - Numbered lists for steps or priorities

### Productivity Tips

1. **Fast Editing**
   - Use formatting toolbar keyboard shortcuts
   - Copy-paste content from other sources
   - Use tabs to organize different sections

2. **AI Assistance**
   - Ask for content generation ideas
   - Get grammar and style suggestions
   - Request content summarization
   - Ask for translation assistance

3. **Review Process**
   - Read through your content before submitting
   - Check confidence score for quality assessment
   - Use AI to identify improvement areas
   - Compare with similar product descriptions

### Troubleshooting

**Problem**: Confidence score seems low
**Solution**: Ask the AI for specific improvement suggestions

**Problem**: Can't find a formatting option
**Solution**: Use the AI to ask about available formatting features

**Problem**: AI responses seem irrelevant
**Solution**: Rephrase your question or provide more context

**Problem**: Text isn't formatting correctly
**Solution**: Select the text first, then apply formatting

## Advanced Features

### Exporting & Sharing (Future)
- Export to PDF
- Export to Word
- Generate shareable link
- Copy formatted text

### Collaboration (Future)
- Share with team members
- Real-time editing
- Comments and suggestions
- Version history

### Integration (Future)
- Connect with backend services
- API integrations
- Webhook support
- Automation workflows

## Best Practices

1. **Save Regularly**: Use browser auto-save or implement local storage
2. **Verify AI Output**: Always review AI-generated content
3. **Test Formatting**: Preview content before final submission
4. **Gather Feedback**: Use the review submission feature
5. **Update Content**: Regularly revisit and improve product descriptions

## Getting Support

For issues, feature requests, or questions:
1. Check the README.md for setup instructions
2. Review the DEPLOYMENT.md for deployment help
3. Check copilot-instructions.md for development guidelines
4. Create an issue in the repository

## Roadmap

Upcoming features include:
- Real AI backend integration
- Advanced analytics and metrics
- Template system
- Batch processing
- Multi-language support
- Accessibility improvements
