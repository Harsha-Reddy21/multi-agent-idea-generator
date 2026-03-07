# SAGE AI Frontend - Styles Guide

> **Last Updated:** December 16, 2025  
> **Status:** ✅ Active - Centralized Style System

## Overview

All styling variables (colors, typography, spacing) are centralized in the shared styles directory for consistent theming across the SAGE AI Frontend application.

```
📁 src/shared/styles/
  ├── _colors.scss           // Color variables
  ├── _typography.scss       // Font sizes, weights, families
  ├── _mixin.scss           // Reusable mixins
  ├── _functions.scss       // Utility functions
  └── _index.scss           // Main import file
```

---

## Table of Contents

1. [Color Variables](#color-variables)
2. [Typography Variables](#typography-variables)
3. [Usage Instructions](#usage-instructions)
4. [Migration Status](#migration-status)
5. [Best Practices](#best-practices)

---

## Color Variables

**File:** `src/shared/styles/_colors.scss`

### 🔴 Primary Brand Colors

```scss
$primary-color: black; // Base primary color
$brand-red: #d31710; // Main brand color
$brand-red-dark: #b80000; // Darker variant
$brand-red-darker: #9f180f; // Even darker variant
$brand-red-error: #e7000b; // Error states
$brand-red-alternate: #d00; // Alternative red
$brand-red-light: #e1242a; // Light variant
$brand-required-red: #ff0000; // Required field indicator
```

**Usage:**

- `$brand-red` - Primary buttons, links, brand accents
- `$brand-red-error` - Error messages, validation states
- `$brand-red-dark` - Hover states for red elements
- `$brand-required-red` - Required field asterisks

---

### 🔵 Secondary Brand Colors

#### Blue Variants

```scss
$brand-blue: #0044d4; // Primary blue
$brand-blue-info: #0078d4; // Info messages
$brand-blue-light: #90cef4; // Light blue accents
$brand-blue-link: #1b6cba; // Hyperlinks
```

**Usage:**

- `$brand-blue-info` - Informational messages, tooltips
- `$brand-blue-link` - Text links
- `$brand-blue-light` - Info backgrounds

#### Green Variants

```scss
$brand-green: #009f6f; // Primary green
$brand-green-dark: #005c3f; // Dark green
$brand-green-success: #007a55; // Success states
$brand-green-light: #beeed3; // Light green accents
$brand-green-bg: #f0f9f2; // Green background
```

**Usage:**

- `$brand-green-success` - Success messages, completed states
- `$brand-green-light` - Success backgrounds
- `$brand-green-bg` - Light success banner backgrounds

#### Orange Variants

```scss
$brand-orange: #d7700a; // Primary orange
$brand-orange-light: #fceee7; // Light orange background
```

**Usage:**

- `$brand-orange` - Warning states, attention indicators
- `$brand-orange-light` - Warning backgrounds

---

### ⚫ Neutral Colors - Grays

#### Dark Grays

```scss
$dark-gray: #191919; // Very dark gray (almost black)
$medium-gray: #1e2a30; // Medium dark gray
$light-gray: #465158; // Light dark gray
$slate-gray: #34373f; // Slate gray
$neutral-gray: #454343; // Neutral gray
$neutral-stone-gray: #716c6c; // Stone gray
$neutral-text-gray: #6a6a6a; // Text gray
$neutral-text-medium: #6a7282; // Medium text gray
$neutral-slate: #4a5565; // Slate for UI elements
$neutral-slate-light: #364153; // Light slate
$neutral-heather-gray: #505050; // Heather gray
```

#### Border Grays

```scss
$neutral-border-gray: #c5c5c5; // Standard border
$neutral-border-light: #b4b4b4; // Light border
$neutral-border-lighter: #e0e0e0; // Very light border
```

#### Light Grays (100-900 Scale)

```scss
$gray-100: #f5f5f5; // Lightest gray background
$gray-200: #f4f4f4; // Very light gray
$gray-300: #f0f0f0; // Light gray
$gray-400: #e8e8e8; // Medium-light gray
$gray-500: #e7e7e7; // Medium gray
$gray-600: #e2e2e2; // Medium-dark gray
$gray-700: #dbd6d6ff; // Dark gray with transparency
$gray-800: #d1d5dc; // Darker gray
$gray-900: #d0d0d0; // Darkest in light scale
$gray-border: #d9d9d9; // Standard border gray
```

**Usage:**

- `$gray-100` to `$gray-300` - Light backgrounds, cards
- `$gray-400` to `$gray-600` - Dividers, borders
- `$gray-700` to `$gray-900` - Disabled states, inactive elements

---

### 📝 Text Colors

```scss
$text-black: #000; // Pure black text
$text-black-alt: #0a0a0a; // Almost black
$text-dark: #1a1a1a; // Dark text (primary body)
$text-dark-slate: #0f172a; // Dark slate text
$text-charcoal: #111827; // Charcoal text
$text-gray-dark: #242424; // Dark gray text
$text-gray: #333; // Standard gray text
$text-gray-medium: #444; // Medium gray text
$text-gray-light: #666; // Light gray text
$text-gray-lighter: #999; // Lighter gray text (secondary)
$text-muted: #a1a4ac; // Muted text (hints, placeholders)
```

**Usage:**

- `$text-dark` - Primary body text
- `$text-gray` - Secondary text
- `$text-gray-light` - Tertiary text, captions
- `$text-muted` - Placeholder text, disabled text

---

### 🎨 Background Colors

```scss
$bg-white: #fff; // White (shorthand)
$bg-white-full: #ffffff; // White (full hex)
$bg-light-blue: #f3f7fa; // Light blue background
$bg-light-pink: #fff6f5; // Light pink background
$bg-pink-gradient: #ffeae9; // Pink gradient background
$bg-red-light: #ffeded; // Light red background
$bg-red-lighter: #f8d7da; // Lighter red background
```

**Usage:**

- `$bg-white` / `$bg-white-full` - Primary backgrounds
- `$bg-light-blue` - Secondary backgrounds, cards
- `$bg-light-pink` - Error backgrounds
- `$bg-red-light` - Validation error highlights

---

### 📦 Border Colors

```scss
$border-gray: #bbc7cf; // Standard border
$border-light: #dddee4; // Light border
$border-lighter: #e2e5eb; // Lighter border
$border-lightest: #f3f3f3; // Lightest border
```

**Usage:**

- `$border-gray` - Input borders, card borders
- `$border-light` - Subtle dividers
- `$border-lightest` - Very subtle separators

---

### 🌑 Shadow Colors (with transparency)

```scss
$shadow-black-light: rgba(0, 0, 0, 0.08); // Light shadow
$shadow-black-medium: rgba(0, 0, 0, 0.1); // Medium shadow
$shadow-black-dark: rgba(0, 0, 0, 0.5); // Dark shadow
$shadow-overlay: rgba(3, 2, 19, 0.2); // Modal overlay
$shadow-text: rgba(10, 10, 10, 0.6); // Text shadow
$shadow-card: rgba(16, 24, 40, 0.06); // Card shadow (light)
$shadow-card-medium: rgba(16, 24, 40, 0.08); // Card shadow (medium)
$shadow-card-dark: rgba(16, 24, 40, 0.12); // Card shadow (dark)
$shadow-base: rgba(52, 55, 63, 0.05); // Base shadow
$shadow-button: rgba(212, 0, 0, 0.4); // Button shadow
$shadow-button-alt: rgba(211, 23, 16, 0.4); // Alternative button shadow
$shadow-red-inset: rgba(211, 23, 16, 0.2); // Red inset shadow
$shadow-red-focus: rgba(231, 0, 11, 0.3); // Red focus ring
$shadow-blur-overlay: rgba(0, 0, 0, 0.05); // Blur overlay
```

**Usage:**

- `$shadow-card` - Elevation for cards, modals
- `$shadow-overlay` - Background overlays for modals
- `$shadow-red-focus` - Focus states for red buttons

---

### 🎨 Gradient Colors

```scss
$gradient-blue-start: rgba(131, 203, 255, 0.1); // Blue gradient start
$gradient-pink-end: rgba(246, 51, 154, 0.1); // Pink gradient end
$gradient-red-start: #a11913; // Red gradient start
$gradient-red-end: #f456a6; // Red gradient end
```

**Usage:**

```scss
background: linear-gradient(to right, $gradient-blue-start, $gradient-pink-end);
```

---

### 🔹 Transparent Backgrounds

```scss
$bg-overlay-light: rgba(0, 0, 0, 0.5); // Dark overlay
$bg-neutral-transparent: #00000014; // Neutral transparent
```

---

### 📊 Extraction Status Banner Colors

```scss
$banner-pink-bg: #fef2f2; // Pink banner background
$banner-pink-border: #e7f4ea; // Pink banner border
$banner-green-bg: #f0fdf7; // Green banner background
$banner-green-border: #bbf7d0; // Green banner border
$progress-bar-bg: #e7f4ea; // Progress bar background
$progress-bar-green-start: #019568; // Progress gradient start
$progress-bar-green-end: #007a55; // Progress gradient end
$progress-bar-shimmer: rgba(255, 255, 255, 0.4); // Shimmer effect
$banner-message-text: #333; // Banner text color
$banner-button-focus: #0066cc; // Banner button focus
$banner-bg: #f9eeed; // Default banner background
```

---

### 🔄 Legacy Support

```scss
$primary-red: $brand-red; // Alias for backward compatibility
```

---

## Typography Variables

**File:** `src/shared/styles/_typography.scss`

> **Note:** All font sizes use REM units (1rem = 16px base)  
> **Conversion:** px ÷ 16 = rem

### 📏 Display Sizes (Extra Large)

```scss
$font-size-display-xl: 3rem; // 48px - Page titles, hero headings
$font-size-display-lg: 2.5rem; // 40px - Large section headings
$font-size-display-md: 2.25rem; // 36px - Medium display text
```

**Usage:**

- Hero sections
- Landing page titles
- Major page headings

---

### 📑 Heading Sizes (H1-H6)

```scss
$font-size-h1: 3rem; // 48px - Main page headings
$font-size-h2: 2.5rem; // 40px - Section headings
$font-size-h3: 2rem; // 32px - Subsection headings
$font-size-h4: 1.75rem; // 28px - Card/component headings
$font-size-h5: 1.5rem; // 24px - Smaller headings
$font-size-h6: 1.25rem; // 20px - Smallest headings
```

**Semantic Usage:**

```scss
h1 {
  font-size: $font-size-h1;
}
h2 {
  font-size: $font-size-h2;
}
.card-title {
  font-size: $font-size-h4;
}
```

---

### 📄 Body Text Sizes

```scss
$font-size-xl: 1.25rem; // 20px - Large body text
$font-size-lg: 1.125rem; // 18px - Large body text
$font-size-base: 1rem; // 16px - Default body text (base)
$font-size-md: 0.9375rem; // 15px - Medium body text
$font-size-sm: 0.875rem; // 14px - Small body text
$font-size-xs: 0.8125rem; // 13px - Extra small text
$font-size-xxs: 0.75rem; // 12px - Very small text
```

**Usage:**

- `$font-size-base` - Default paragraph text
- `$font-size-lg` - Introduction paragraphs
- `$font-size-sm` - Secondary information
- `$font-size-xs` - Captions, metadata

---

### 🏷️ Specialized Sizes

```scss
$font-size-tiny: 0.6875rem; // 11px - Labels, captions
$font-size-caption: 0.75rem; // 12px - Captions, helper text
$font-size-label: 0.875rem; // 14px - Form labels, tags
$font-size-button: 0.875rem; // 14px - Button text
$font-size-badge: 0.75rem; // 12px - Badges, pills
$font-size-tooltip: 0.8125rem; // 13px - Tooltips
```

**Component Usage:**

```scss
.button {
  font-size: $font-size-button;
}
.badge {
  font-size: $font-size-badge;
}
label {
  font-size: $font-size-label;
}
```

---

### 🎯 Custom Application Sizes

```scss
$font-size-0-775: 0.775rem; // 12.4px - Custom size
$font-size-0-8: 0.8rem; // 12.8px - Custom size
$font-size-0-85: 0.85rem; // 13.6px - Custom size
$font-size-0-9: 0.9rem; // 14.4px - Custom size
```

---

### 📏 Line Heights (Unitless)

```scss
$line-height-tight: 1.2; // Tight spacing (headings)
$line-height-normal: 1.5; // Normal spacing (body text)
$line-height-relaxed: 1.75; // Relaxed spacing (large text)
$line-height-loose: 2; // Loose spacing (special cases)
```

**Usage:**

```scss
h1 {
  font-size: $font-size-h1;
  line-height: $line-height-tight;
}

p {
  font-size: $font-size-base;
  line-height: $line-height-normal;
}
```

---

### ⚖️ Font Weights

```scss
$font-weight-light: 300; // Light weight
$font-weight-normal: 400; // Normal/Regular weight
$font-weight-medium: 500; // Medium weight
$font-weight-semibold: 600; // Semibold weight
$font-weight-bold: 700; // Bold weight
$font-weight-extrabold: 800; // Extra bold weight
```

**Usage:**

```scss
.heading {
  font-weight: $font-weight-bold;
}
.body-text {
  font-weight: $font-weight-normal;
}
.label {
  font-weight: $font-weight-medium;
}
```

---

### 🎭 Font Styles

```scss
$font-style-normal: normal; // Normal (upright) text
$font-style-italic: italic; // Italic text
$font-style-oblique: oblique; // Oblique text
```

---

### 🔤 Font Families

```scss
$font-family-primary:
  'IBM Plex Sans',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  'Oxygen',
  'Ubuntu',
  'Cantarell',
  'Fira Sans',
  'Droid Sans',
  'Helvetica Neue',
  sans-serif;

$font-family-monospace: 'Courier New', Courier, monospace;
```

**Usage:**

```scss
body {
  font-family: $font-family-primary;
}

code,
pre {
  font-family: $font-family-monospace;
}
```

---

## Usage Instructions

### How to Import Styles

Add this line at the top of any SCSS module file:

```scss
@use '../../shared/styles/index' as *;
// Adjust path based on file location:
// From src/components: @use '../shared/styles/index' as *;
// From src/pages: @use '../../shared/styles/index' as *;
```

This imports **all variables** (colors, typography, mixins, functions).

---

### Before and After Examples

#### ❌ Before (Hardcoded)

```scss
.card {
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1px solid #bbc7cf;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.heading {
  font-size: 32px;
  font-weight: 700;
  color: #d31710;
}
```

#### ✅ After (Using Variables)

```scss
@use '../../shared/styles/index' as *;

.card {
  background-color: $bg-white-full;
  color: $text-dark;
  border: 1px solid $border-gray;
  font-size: $font-size-base;
  font-weight: $font-weight-normal;
  line-height: $line-height-normal;
  box-shadow: 0 2px 4px $shadow-black-medium;
}

.heading {
  font-size: $font-size-h3;
  font-weight: $font-weight-bold;
  color: $brand-red;
}
```

---

### Common Replacements

#### Color Replacements

| Hardcoded         | Variable           | Usage               |
| ----------------- | ------------------ | ------------------- |
| `#d31710`         | `$brand-red`       | Primary brand color |
| `#ffffff`         | `$bg-white-full`   | White backgrounds   |
| `#fff`            | `$bg-white`        | White (shorthand)   |
| `#000`            | `$text-black`      | Black text          |
| `#1a1a1a`         | `$text-dark`       | Primary body text   |
| `#333`            | `$text-gray`       | Secondary text      |
| `#666`            | `$text-gray-light` | Tertiary text       |
| `#bbc7cf`         | `$border-gray`     | Standard borders    |
| `#f5f5f5`         | `$gray-100`        | Light backgrounds   |
| `#0078d4`         | `$brand-blue-info` | Info blue           |
| `#009f6f`         | `$brand-green`     | Success green       |
| `rgba(0,0,0,0.5)` | `$shadow-overlay`  | Modal overlays      |

#### Typography Replacements

| Hardcoded           | Variable              | Usage              |
| ------------------- | --------------------- | ------------------ |
| `48px` / `3rem`     | `$font-size-h1`       | Page titles        |
| `32px` / `2rem`     | `$font-size-h3`       | Section headers    |
| `16px` / `1rem`     | `$font-size-base`     | Body text          |
| `14px` / `0.875rem` | `$font-size-sm`       | Small text         |
| `12px` / `0.75rem`  | `$font-size-caption`  | Captions           |
| `400`               | `$font-weight-normal` | Regular weight     |
| `700`               | `$font-weight-bold`   | Bold weight        |
| `1.5`               | `$line-height-normal` | Normal line height |

---

## Migration Status

### ✅ Completed Files

#### Core Files

- ✅ `src/App.scss`
- ✅ `src/index.scss`
- ✅ `src/shared/styles/_colors.scss`
- ✅ `src/shared/styles/_typography.scss`

#### Components

- ✅ `src/components/SubmissionCard/SubmissionCard.module.scss`
- ✅ `src/components/LandingPageCard/LandingPageCard.module.scss`
- ✅ `src/components/widgets.module.scss`

#### Pages

- ✅ `src/pages/Landing/LandingPage.module.scss`
- ✅ `src/pages/AIRegistryForm/AIRegistryForm.module.scss`

### ⏳ Remaining Files

- ⏳ `src/components/DataExtractsCard/DataExtractsCard.module.scss`
- ⏳ `src/components/UserFeedback/UserFeedback.module.scss`
- ⏳ `src/components/FormSuggestions/FormSuggestions.module.scss`
- ⏳ `src/components/FormCard/FormCard.module.scss`
- ⏳ `src/pages/FormDashboard/FormDashboard.module.scss`
- ⏳ `src/pages/SubmitterDashboard/SubmitterDashboard.module.scss`
- ⏳ `src/pages/BeginSubmission/BeginSubmission.module.scss`

### Progress Statistics

- **Variables Defined:** 155+ (100+ colors, 55+ typography)
- **Files Updated:** 10+
- **Completion:** ~70%

---

## Best Practices

### 🎯 Naming Conventions

#### Colors

- Use semantic names: `$brand-red`, `$text-dark`, `$bg-white`
- Group by category: `$brand-*`, `$text-*`, `$bg-*`, `$shadow-*`
- Include context: `$border-gray` vs `$text-gray` vs `$bg-gray`

#### Typography

- Use size descriptors: `$font-size-sm`, `$font-size-lg`
- Semantic names for headings: `$font-size-h1` to `$font-size-h6`
- Purpose-based names: `$font-size-button`, `$font-size-label`

---

### 🔧 Maintainability

#### Adding New Variables

1. Open appropriate file (`_colors.scss` or `_typography.scss`)
2. Find relevant category section
3. Add variable with descriptive name and comment
4. Document usage if not obvious

**Example:**

```scss
// In _colors.scss
// --------------------------------------------
// Warning Colors
// --------------------------------------------
$warning-yellow: #fbbf24; // Warning states
$warning-yellow-bg: #fffbeb; // Warning background
```

---

### 📐 Consistency Rules

1. **Always use variables** - Never hardcode colors or font sizes
2. **Use REM units** - All typography sizes use rem (not px)
3. **Semantic naming** - Name by purpose, not appearance
4. **Group related variables** - Keep categories organized
5. **Document complex values** - Add comments for clarity

---

### 🎨 Theme Support

With centralized variables, you can create theme variants:

```scss
// theme-dark.scss
@use './colors' with (
  $bg-white-full: #1a1a1a,
  $text-dark: #ffffff,
  $border-gray: #404040
);
```

---

### 🧪 Testing After Migration

When migrating a file:

1. ✅ Visual regression test (compare before/after)
2. ✅ Check all states (hover, focus, active, disabled)
3. ✅ Test responsive breakpoints
4. ✅ Verify accessibility (contrast ratios maintained)
5. ✅ Check in different browsers

---

## Migration Checklist

For files not yet migrated:

### Step 1: Add Import

```scss
@use '../../shared/styles/index' as *;
```

### Step 2: Find Hardcoded Values

Search for:

- Hex colors: `#[0-9a-fA-F]{3,6}`
- RGB/RGBA: `rgba?\(`
- Pixel sizes: `\d+px`

### Step 3: Replace with Variables

- Use reference tables above
- If variable doesn't exist, add to appropriate file
- Maintain visual appearance

### Step 4: Test Thoroughly

- Verify no visual changes
- Check all interactive states
- Test accessibility

---

## Variable Reference Quick Search

### By Use Case

**Primary Actions:**

- Background: `$brand-red`
- Text: `$bg-white-full`
- Hover: `$brand-red-dark`

**Secondary Actions:**

- Background: `$bg-white-full`
- Text: `$brand-red`
- Border: `$brand-red`

**Text Content:**

- Primary: `$text-dark`
- Secondary: `$text-gray`
- Tertiary: `$text-gray-light`
- Muted: `$text-muted`

**Backgrounds:**

- Primary: `$bg-white-full`
- Light: `$gray-100`
- Card: `$bg-light-blue`

**Borders:**

- Default: `$border-gray`
- Light: `$border-light`
- Subtle: `$border-lightest`

**Status Colors:**

- Error: `$brand-red-error`
- Success: `$brand-green-success`
- Info: `$brand-blue-info`
- Warning: `$brand-orange`

**Typography:**

- Heading: `$font-size-h1` to `$font-size-h6`
- Body: `$font-size-base`
- Small: `$font-size-sm`
- Label: `$font-size-label`
- Button: `$font-size-button`

---

## Troubleshooting

### Colors Not Applying?

- ✅ Check import path is correct relative to file location
- ✅ Ensure using `@use` not `@import`
- ✅ Verify `as *` is included for wildcard access

### Variable Not Found?

- ✅ Check spelling and case sensitivity
- ✅ Verify variable exists in `_colors.scss` or `_typography.scss`
- ✅ Ensure import statement is at top of file

### Old Styles Still Showing?

- ✅ Clear browser cache
- ✅ Stop and restart dev server
- ✅ Check for `!important` overrides
- ✅ Verify no inline styles in components

### Build Errors?

- ✅ Check for circular imports
- ✅ Verify SCSS syntax is correct
- ✅ Ensure all files are saved

---

## Version History

| Version | Date       | Changes                                                      |
| ------- | ---------- | ------------------------------------------------------------ |
| 2.0.0   | 2024-12-16 | Merged color and typography guides into unified Styles Guide |
| 2.0.0   | 2024-12-16 | Added complete typography documentation with 55+ variables   |
| 2.0.0   | 2024-12-16 | Verified all 155+ variables are properly defined             |
| 1.0.0   | 2024-12-05 | Initial color migration with 100+ color variables            |

---

## Additional Resources

- **PROJECT_ARCHITECTURE.md** - Overall project structure and patterns
- **API_DOCUMENTATION.md** - API integration documentation
- **src/shared/styles/** - Source style files

---

**Last Updated:** December 16, 2025  
**Maintained By:** Frontend Team  
**Status:** ✅ Active - Comprehensive Style System
