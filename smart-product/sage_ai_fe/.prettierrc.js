export default {
  // No semicolons — `const x = 5` instead of `const x = 5;`
  semi: false,
  // Use single quotes — `'hello'` instead of `"hello"`
  singleQuote: true,
  // Add trailing commas where valid in ES5 — `[1, 2,]`
  trailingComma: 'es5',
  // Indent with 2 spaces — good for readability
  tabWidth: 2,
  // Wrap lines longer than 80 chars — keeps code neat
  printWidth: 80,
  // Omit parens when possible — `x => x` instead of `(x) => x`
  arrowParens: 'avoid',
  // Use system default line endings — avoids Git issues
  endOfLine: 'auto',
  // Add space in object literals — `{ a: 1 }` not `{a:1}`
  bracketSpacing: true,
}
