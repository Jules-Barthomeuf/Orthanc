# ORTHANC - Deployment & Security Guide

## Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orthanc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.production.local` file:

```env
# Change this to a secure random string in production
JWT_SECRET=<generate-secure-random-string>

# Production API URL
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Database configuration (when ready to integrate)
DATABASE_URL=your-production-database-url
```

### Generate Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Cloud Deployment Options

### Vercel (Recommended for Next.js)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy

### AWS (EC2 + CloudFront)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - Install Node.js 18+
   - Clone repository
   - Install dependencies: `npm install`
   - Build: `npm run build`

2. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "orthanc" -- start
   pm2 save
   ```

3. **Set up Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t orthanc .
   docker run -p 3000:3000 -e JWT_SECRET=<your-secret> orthanc
   ```

## Security Checklist

### Authentication
- [ ] Update JWT_SECRET in production
- [ ] Use HTTPS/TLS only
- [ ] Implement password requirements
- [ ] Add rate limiting on login attempts
- [ ] Enable CSRF protection

### Data Protection
- [ ] Enable database encryption
- [ ] Use encrypted connections to database
- [ ] Implement input validation
- [ ] Use parameterized queries
- [ ] Add SQL injection protection

### API Security
- [ ] Add API authentication tokens
- [ ] Implement request rate limiting
- [ ] Add CORS properly configured
- [ ] Validate all user inputs
- [ ] Implement request size limits

### Infrastructure
- [ ] Enable HTTPS/TLS
- [ ] Configure security headers
- [ ] Enable firewall rules
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Sensitive Data
- [ ] Never commit .env files
- [ ] Use environment variables for secrets
- [ ] Implement proper logging (no sensitive data)
- [ ] Use secure document storage
- [ ] Enable access logging

## Monitoring & Logging

### Application Monitoring

1. **Error Tracking (Sentry)**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Performance Monitoring (Datadog)**
   - Set up APM
   - Monitor response times
   - Track errors

3. **Logs**
   - Use structured logging
   - Log all authentication events
   - Monitor for suspicious activity

## Database Integration

### When Ready for Real Data

Update `lib/db.ts` to connect to:

- **PostgreSQL** - Production-grade relational database
- **MongoDB** - For document-based storage
- **Firebase** - Fully managed solution

Example PostgreSQL setup:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
```

## API Integration

When ready to connect real APIs:

1. **Create API service layer**
   - `lib/services/propstream.ts`
   - `lib/services/mls.ts`
   - `lib/services/blockchain.ts`

2. **Update data fetching**
   - Move from mock data to real API calls
   - Implement caching
   - Handle API rate limits

3. **Error handling**
   - Implement retry logic
   - Graceful degradation
   - User-friendly error messages

## Performance Optimization

- [ ] Enable Next.js Image optimization
- [ ] Implement caching strategies
- [ ] Use CDN for static assets
- [ ] Optimize database queries
- [ ] Enable compression
- [ ] Implement lazy loading

## Backup & Disaster Recovery

- [ ] Daily database backups
- [ ] Test backup restoration
- [ ] Implement failover system
- [ ] Document recovery procedures
- [ ] Keep off-site backups

## Support & Maintenance

- Regular dependency updates
- Security patches as needed
- Monitor for vulnerabilities
- Performance optimization
- Feature enhancements

---

For more information, see main [README.md](./README.md)
