# Deployment Guide - Smart Product Profile

This guide provides instructions for deploying the Smart Product Profile application to various hosting platforms.

## Pre-Deployment Checklist

Before deploying, ensure:
- [ ] All TypeScript errors are resolved: `npm run build`
- [ ] Code is tested locally: `npm run dev`
- [ ] Environment variables are configured (if needed)
- [ ] README is up to date
- [ ] Dependencies are installed: `npm install`

## Production Build

### Create a Production Build
```bash
npm run build
```

This generates a `dist/` folder containing:
- Optimized HTML
- Minified CSS
- Optimized JavaScript bundles
- Gzip-compressed assets

### Preview Production Build Locally
```bash
npm run preview
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides seamless deployment for Vite + React projects.

**Steps:**
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy automatically on push to main branch

### 2. Netlify

**Manual Deployment:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

**GitHub Integration:**
1. Connect your repository to Netlify
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Deploy on push

### 3. GitHub Pages

**Steps:**
1. Update `vite.config.ts` to set `base`:
```typescript
export default defineConfig({
  base: '/smart-product-profile/', // Change to your repo name
  plugins: [react()],
})
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

### 4. Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build and run:**
```bash
docker build -t smart-product-profile .
docker run -p 3000:3000 smart-product-profile
```

### 5. Traditional Web Server (Nginx/Apache)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/smart-product-profile/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Deploy:**
```bash
npm run build
scp -r dist/* user@server:/var/www/smart-product-profile/dist/
```

## Environment Configuration

### Build-Time Variables

If your app needs environment variables:

**Create `.env` file:**
```
VITE_API_URL=https://api.example.com
VITE_AI_SERVICE=https://ai-service.example.com
```

**Update `.gitignore` to exclude `.env` from version control:**
```
.env
.env.local
.env.*.local
```

**Access in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Environment-Specific Configurations

**Development:**
```
VITE_API_URL=http://localhost:3000
```

**Production:**
```
VITE_API_URL=https://api.production.com
```

## Performance Optimization

### Enable Gzip Compression
Most hosting platforms do this automatically. Verify in your server configuration.

### CDN Configuration
Place your assets on a CDN for faster global delivery:
- Cloudflare
- CloudFront (AWS)
- Akamai

### Image Optimization
Compress and optimize any images before deployment:
```bash
npm install -D imagemin-cli imagemin-webp
```

## Monitoring & Logging

### Sentry for Error Tracking
Install Sentry for production error monitoring:
```bash
npm install @sentry/react @sentry/tracing
```

### Analytics
Consider adding Google Analytics or similar:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## Security Checklist

- [ ] Set proper CORS headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Enable HTTPS only
- [ ] Set security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Regular dependency updates: `npm audit`
- [ ] Use environment variables for sensitive data

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### 404 on Refresh
Ensure your server redirects all routes to `index.html` (Single Page Application)

### Asset Path Issues
If deployed to a subdirectory, update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/subdirectory/',
  plugins: [react()],
})
```

## Rollback Procedure

Keep previous deployment versions available:
1. Tag releases in Git: `git tag -a v1.0.0`
2. Push tags: `git push --tags`
3. Maintain backup of dist folder before deployment

## Support

For deployment issues, refer to:
- Vite Documentation: https://vitejs.dev/guide/deployment.html
- React Documentation: https://react.dev/
- Platform-specific docs (Vercel, Netlify, etc.)
