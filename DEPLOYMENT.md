# Deployment Guide

## Production Deployment

### Backend Deployment (Node.js + SQLite)

#### Option 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```powershell
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```powershell
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```powershell
   heroku config:set JWT_SECRET=your_production_secret_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```powershell
   git push heroku main
   ```

#### Option 2: Deploy to Railway

1. **Connect GitHub Repository**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"

2. **Configure Environment**
   - Set `JWT_SECRET` in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Railway auto-deploys on push to main

#### Option 3: Deploy to DigitalOcean

1. **Create Droplet**
   - Ubuntu 20.04 LTS
   - 1GB RAM minimum

2. **SSH into Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone Repository**
   ```bash
   git clone your_repo_url
   cd Mentorproject/backend
   npm install
   ```

5. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "mentor-api"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   ```

   Create `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo systemctl restart nginx
   ```

### Frontend Deployment (React + Vite)

#### Option 1: Deploy to Vercel

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy**
   ```powershell
   cd frontend
   vercel
   ```

3. **Configure Environment**
   - Set API endpoint in Vercel dashboard
   - Update vite.config.js with production API URL

#### Option 2: Deploy to Netlify

1. **Build Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```powershell
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Configure Redirects**
   Create `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Option 3: Deploy to GitHub Pages

1. **Update vite.config.js**
   ```javascript
   export default {
     base: '/Mentorproject/',
     // ... other config
   }
   ```

2. **Build**
   ```powershell
   npm run build
   ```

3. **Push to GitHub**
   ```powershell
   git add .
   git commit -m "Production build"
   git push origin main
   ```

### Database Migration for Production

#### Using PostgreSQL (Recommended for Production)

1. **Update Backend Dependencies**
   ```powershell
   npm install pg
   ```

2. **Create New db-postgres.js**
   ```javascript
   import pg from 'pg';
   const { Pool } = pg;

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });

   export async function initializeDatabase() {
     // Create tables using PostgreSQL syntax
   }
   ```

3. **Set DATABASE_URL in Production**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

## Performance Optimization

### Backend Optimization

1. **Enable Compression**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Add Caching Headers**
   ```javascript
   app.use((req, res, next) => {
     res.set('Cache-Control', 'public, max-age=3600');
     next();
   });
   ```

3. **Database Connection Pooling**
   - Use connection pools for PostgreSQL
   - Implement query caching

### Frontend Optimization

1. **Code Splitting**
   ```javascript
   // Vite automatically handles this
   ```

2. **Image Optimization**
   - Use WebP format
   - Lazy load images

3. **Bundle Analysis**
   ```powershell
   npm run build -- --analyze
   ```

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS/SSL certificate
- [ ] Set CORS to specific domains only
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Use environment variables for secrets
- [ ] Enable CSRF protection
- [ ] Implement input sanitization
- [ ] Add security headers (Helmet.js)
- [ ] Regular security audits

## Monitoring & Logging

### Backend Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Error Tracking

- Use Sentry for error tracking
- Set up uptime monitoring (UptimeRobot)
- Monitor database performance

## Backup Strategy

### Database Backups

```bash
# SQLite backup
cp mentor_portal.db mentor_portal.db.backup

# PostgreSQL backup
pg_dump dbname > backup.sql

# Automated backup (cron job)
0 2 * * * pg_dump dbname | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Version Control

- Use Git for version control
- Tag releases
- Maintain changelog

## Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancer (Nginx, HAProxy)
   - Deploy multiple backend instances
   - Use session store (Redis)

2. **Database Scaling**
   - Migrate to PostgreSQL
   - Implement read replicas
   - Use connection pooling

3. **Caching Layer**
   - Implement Redis cache
   - Cache frequently accessed data
   - Invalidate cache on updates

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
          cd ../frontend
          npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to production
        run: |
          # Add deployment commands
```

## Troubleshooting Production Issues

### High Memory Usage
- Check for memory leaks
- Implement garbage collection
- Use profiling tools

### Slow API Responses
- Analyze database queries
- Add indexes to frequently queried fields
- Implement caching

### Database Connection Errors
- Check connection pool settings
- Monitor active connections
- Implement retry logic

## Rollback Procedure

1. **Identify Issue**
   ```bash
   git log --oneline
   ```

2. **Revert to Previous Version**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Restore Database**
   ```bash
   # Restore from backup
   ```

## Support & Maintenance

- Monitor error logs daily
- Update dependencies monthly
- Perform security audits quarterly
- Review performance metrics weekly
