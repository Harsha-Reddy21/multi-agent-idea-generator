import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import jsonc from 'eslint-plugin-jsonc'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import jsoncParser from 'jsonc-eslint-parser'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // ✅ Base JS/TS config
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ...js.configs.recommended,
  },

  // 🌐 Global browser env support (window, document, etc.)
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },

  // 🧠 TypeScript recommended rules
  tseslint.configs.recommended,

  // ⚛️ React recommended (flat config style)
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 🧹 Disable ESLint formatting that conflicts with Prettier
  prettierConfig,

  // 🎯 Custom rules and plugins
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // ⚛️ REACT RULES
      // No need to import React in scope (React 17+)
      'react/react-in-jsx-scope': 'off',
      // Disable PropTypes (using TypeScript instead)
      'react/prop-types': 'off',
      // Don’t enforce display name on components
      'react/display-name': 'off',
      // Warn on links with target="_blank" and no rel="noopener"
      'react/jsx-no-target-blank': 'warn',
      // Warn for unescaped characters like < or >
      'react/no-unescaped-entities': 'warn',

      // 📦 IMPORT SORTING RULES
      // Sort import statements alphabetically/grouped
      'simple-import-sort/imports': 'warn',
      // Sort export statements
      'simple-import-sort/exports': 'warn',

      // 🧼 GENERAL JS/TS RULES
      // Allow console.warn and console.error only
      // e.g., console.log() => warn
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Same for TS unused vars
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      // Warn when using `any` type
      '@typescript-eslint/no-explicit-any': 'warn',
      // Don’t enforce explicit return type on functions
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Warn on empty functions (except arrow funcs or placeholder handlers)
      '@typescript-eslint/no-empty-function': 'warn',
      // Allow empty catch blocks but warn otherwise
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Allow reassignment of function parameters, but not their props
      'no-param-reassign': ['warn', { props: false }],
      // Allow named exports even if only one export is present
      'import/prefer-default-export': 'off',
    },
  },

  // 🧾 JSON/JSONC formatting rules
  {
    files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc,
    },
    rules: {
      // Sort object keys alphabetically
      'jsonc/sort-keys': 'warn',
      // Enforce 2-space indentation
      'jsonc/indent': ['error', 2],
      // Enforce double quotes
      'jsonc/quotes': ['error', 'double'],
      // Always quote property names
      'jsonc/quote-props': ['error', 'always'],
      // No trailing commas
      'jsonc/comma-dangle': ['error', 'never'],
    },
  },

  //🧑‍🦯 Accessibility rules for JSX elements
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Ensure <img> tags have alt text
      'jsx-a11y/alt-text': 'warn',
      // Avoid empty or contentless anchor tags
      'jsx-a11y/anchor-has-content': 'warn',
      // Prevent <a> tags without valid href or with invalid href
      'jsx-a11y/anchor-is-valid': 'warn',
      // Ensure <html> tag has a lang attribute
      'jsx-a11y/html-has-lang': 'warn',
      // <iframe> elements must have a title
      'jsx-a11y/iframe-has-title': 'warn',
      // Warn on redundant words in <img alt=""> like "image", "photo", etc.
      'jsx-a11y/img-redundant-alt': 'warn',
      // Every <label> should have an associated form control
      'jsx-a11y/label-has-associated-control': 'warn',
      // Elements with ARIA roles must have required ARIA attributes
      'jsx-a11y/role-has-required-aria-props': 'warn',
      // Avoid redundant ARIA roles (e.g., <button role="button">)
      'jsx-a11y/no-redundant-roles': 'warn',
      // Only use ARIA roles/props that are valid
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      // For videos
      'jsx-a11y/media-has-caption': 'warn',
      // If using <html lang="">
      'jsx-a11y/lang': 'warn',
    },
  },
  // 🗂️ Ignored files and directories
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.env',
      '*.config.js',
      'public/',
      'coverage/',
      'package-lock.json',
      '.husky/',
    ],
  },
])
