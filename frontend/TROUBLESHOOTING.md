# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Application Won't Start

#### Issue: Port 5173 already in use
```
Error: Port 5173 is already in use
```

**Solution:**
```bash
# Option 1: Use a different port
npm run dev -- --port 5174

# Option 2: Kill the process using port 5173
# Windows PowerShell
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

#### Issue: Dependencies not installed
```
Error: Cannot find module 'react'
```

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Issue: Node version too old
```
Error: Requires Node.js version 20.19+ or 22.12+
```

**Solution:**
1. [Download Node.js 20.19+ or higher](https://nodejs.org/)
2. Install the newer version
3. Run `node --version` to verify
4. Try `npm run dev` again

---

### 🔴 Build Errors

#### Issue: TypeScript compilation error
```
Error: src/App.tsx error TS1234
```

**Solution:**
```bash
# Clear cache
npm run build

# Check the error message
# Fix the TypeScript error in the mentioned file
# Common fixes:
# - Check for unused imports
# - Verify type definitions
# - Check for missing semicolons
```

#### Issue: Build creates empty dist folder
**Solution:**
```bash
# Rebuild with verbose output
npm run build -- --debug

# Check for errors in the output
# Try:
npm run build -- --minify false
```

---

### 🔴 Runtime Errors

#### Issue: "Cannot read property of undefined"
**Solution:**
1. Open browser console (F12)
2. Note the exact error and line number
3. Check that component is passing props correctly
4. Verify state is initialized properly

#### Issue: Styling not applied
**Solution:**
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear browser cache
# Clear browser cache in settings
```

#### Issue: AI Panel not responding
**Solution:**
1. Check browser console for errors (F12)
2. Verify input field is focused
3. Try typing and pressing Enter
4. Reload the page

---

### 🔴 Development Issues

#### Issue: Changes not reflecting in browser
**Solution:**
```bash
# Hard refresh
Ctrl+Shift+R

# If HMR is broken, restart dev server
# Stop the dev server (Ctrl+C)
npm run dev
```

#### Issue: CSS not updating
**Solution:**
```bash
# Check for CSS syntax errors
# Validate your CSS in src/styles/*.css

# Restart dev server if cache is stale
Ctrl+C
npm run dev
```

#### Issue: Component not rendering
**Solution:**
1. Check component export: `export const ComponentName`
2. Verify component import in App.tsx
3. Check for TypeScript errors
4. Verify JSX syntax is correct

---

### 🔴 Deployment Issues

#### Issue: Build succeeds but deployed app doesn't work
**Solution:**
```bash
# Test locally first
npm run build
npm run preview

# Check for:
# - Hardcoded URLs (should be relative)
# - Missing environment variables
# - Asset paths (if deploying to subdirectory)
```

#### Issue: 404 errors on page refresh
**Solution:**
For single-page apps, configure your server to redirect all routes to `index.html`

**Vercel**: Automatic
**Netlify**: Automatic
**Other servers**: Update redirect rules

#### Issue: Assets (CSS/JS) not loading
**Solution:**
1. Check browser Network tab (F12)
2. Verify file paths in dist folder
3. If deployed to subdirectory, update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/subdirectory/',
  plugins: [react()],
})
```

---

### 🔴 Editor Issues

#### Issue: Text editor formatting not working
**Solution:**
```bash
# This is a UI mock-up, formatting uses standard execCommand
# Buttons are functional but text won't visually change
# (This is by design - requires a real editor library for visual feedback)
```

#### Issue: Can't edit product title
**Solution:**
1. Click directly on the text "Untitled Product"
2. Wait for text to become editable
3. Clear it and type new name
4. Click elsewhere to save

---

### 🟡 Performance Issues

#### Issue: App is slow / laggy
**Solution:**
```bash
# Check browser performance
# 1. Open DevTools (F12)
# 2. Go to Performance tab
# 3. Click record and interact with app
# 4. Check for slow operations

# Common causes:
# - Too many re-renders
# - Large CSS/JS bundles
# - Browser extensions interfering
```

#### Issue: High memory usage
**Solution:**
1. Close other tabs and applications
2. Restart the dev server
3. Check browser extensions

---

### 🟡 Feature Issues

#### Issue: AI chat not working
**Solution:**
1. Type a message in the input field
2. Press Enter or click send button
3. AI should respond with simulated message
4. (Real AI integration requires backend API)

#### Issue: Expand/Collapse buttons not working
**Solution:**
1. Click the ◀ button in editor header to expand editor
2. Click the ▶ button in AI panel header to expand AI
3. Verify you're clicking the correct button
4. Reload page if stuck

---

## Debug Mode

### Enable Debug Logging

Create an `.env` file:
```
VITE_DEBUG=true
```

Then add to your component:
```typescript
if (import.meta.env.VITE_DEBUG) {
  console.log('Debug info:', data);
}
```

---

## Browser Console Errors

### How to Read Errors

1. **Open DevTools**: F12 or Right-click → Inspect
2. **Go to Console tab**: Shows all errors
3. **Read the error message**: Describes what went wrong
4. **Note the file and line**: `App.tsx:25` means line 25
5. **Search error**: Google the error message

### Common Error Patterns

```
// Error: Component not found
Cannot find module './Component'
→ Check import path and file exists

// Error: State hook
Hooks can only be called inside the body of a function component
→ Check that hook is in component function, not in condition

// Error: Type mismatch
Property 'xyz' does not exist on type 'XYZ'
→ Check TypeScript types and interfaces

// Error: Undefined reference
Cannot read property 'x' of undefined
→ Check that object exists before accessing property
```

---

## Connection Issues

### API Connection Problems

If connecting to a backend API:

```typescript
// Check if API is running
// Verify API URL in environment variables
// Check CORS headers
// Use browser Network tab to see actual requests

// Test with:
fetch('https://your-api.com/endpoint')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## Performance Optimization

### Check Bundle Size
```bash
npm run build
# Check dist folder size
```

### Optimize Images
- Compress before adding
- Use WebP format
- Lazy load if possible

### Monitor Load Time
- Open DevTools → Network tab
- Check gzip compression
- Verify CDN is being used

---

## File Permission Issues

### Windows Permission Error
```
Error: EACCES: permission denied
```

**Solution:**
```bash
# Run as administrator
# Or reinstall with correct permissions
npm install --save-dev
```

### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Git & Version Control Issues

### Committed node_modules
```bash
# Remove from git
git rm -r --cached node_modules/
git add .gitignore
git commit -m "Remove node_modules from git"
```

### Large commit issues
```bash
# Check commit size
git ls-tree -r -l HEAD | sort -k 4 -rn | head -20

# Exclude large files in .gitignore
```

---

## IDE / Editor Issues

### VS Code IntelliSense Not Working
**Solution:**
1. Reload VS Code window: `Ctrl+Shift+P` → Reload Window
2. Check TypeScript version: `npm ls typescript`
3. Verify `tsconfig.json` exists and is valid

### Formatting Issues
```bash
# Install Prettier
npm install -D prettier

# Format files
npx prettier --write src/
```

---

## Advanced Debugging

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/vite/bin/vite.js
# Open chrome://inspect in Chrome
```

### Build with Sourcemaps
```bash
# In vite.config.ts:
build: {
  sourcemap: true,
}
```

### React DevTools
Install [React DevTools extension](https://react-devtools-tutorial.vercel.app/) to debug components

---

## Getting Help

### Resources
1. [React Documentation](https://react.dev)
2. [Vite Documentation](https://vitejs.dev)
3. [TypeScript Documentation](https://www.typescriptlang.org)
4. [MDN Web Docs](https://developer.mozilla.org)

### How to Report Issues

When reporting issues, include:
1. **Error message**: Full text from console
2. **Steps to reproduce**: What did you do?
3. **Expected behavior**: What should happen?
4. **Actual behavior**: What actually happened?
5. **System info**: OS, Node version, npm version
6. **Screenshots**: If applicable

---

## Preventing Issues

### Best Practices
1. ✅ Run `npm run build` before deploying
2. ✅ Test locally first: `npm run preview`
3. ✅ Keep dependencies updated: `npm update`
4. ✅ Use TypeScript strict mode
5. ✅ Check browser console regularly
6. ✅ Review git diffs before committing
7. ✅ Use .gitignore to exclude node_modules

---

## Still Having Issues?

1. **Check Documentation**
   - [README.md](./README.md)
   - [QUICK_START.md](./QUICK_START.md)
   - [FEATURES.md](./FEATURES.md)

2. **Review Code**
   - Check component files
   - Verify types in `src/types/`
   - Check styles in `src/styles/`

3. **Search for Error**
   - Google the error message
   - Check Stack Overflow
   - Review GitHub issues

4. **Clean Rebuild**
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   npm run dev
   ```

---

**Last Updated**: January 29, 2026
**Version**: 1.0.0
