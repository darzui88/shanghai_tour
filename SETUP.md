# Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **MySQL** (v5.7 or higher) - Install locally or use cloud MySQL service

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies (server)
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Set Up MySQL Database

**Option A: Local MySQL**
- Install MySQL locally from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Start MySQL service
- Create database:
```sql
CREATE DATABASE shanghai_tour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Option B: Cloud MySQL**
- Use services like AWS RDS, Google Cloud SQL, or PlanetScale
- Create a database instance
- Get connection details (host, port, user, password)
- Update database settings in `.env` file

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shanghai_tour
DB_USER=root
DB_PASSWORD=your-password-here
JWT_SECRET=your-secret-key-here-change-this
NODE_ENV=development

# Email configuration (optional, for order notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment configuration (to be added later)
PAYMENT_API_KEY=your-payment-api-key
```

### 4. Start the Application

**Development Mode (both server and client):**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

**Or start separately:**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 5. Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`

## Data Setup

### Add Sample Data

You can add sample data through the API or create a seed script:

```javascript
// Example: Add a product via API
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Chinese Silk Scarf",
  "nameCN": "中国丝绸围巾",
  "description": "Beautiful handcrafted silk scarf",
  "category": "souvenir",
  "price": 299,
  "originalPrice": 399,
  "images": ["https://example.com/scarf.jpg"],
  "tags": ["souvenir", "silk", "handcrafted"],
  "isAvailable": true
}
```

### Scrape Events from SmartShanghai

```bash
npm run scraper
```

Or via API:
```bash
POST http://localhost:5000/api/events/refresh
```

## Troubleshooting

### MySQL Connection Issues
- Ensure MySQL is running (check service status)
- Verify database credentials in `.env` file
- Check if database exists: `SHOW DATABASES;`
- Check firewall settings if using cloud MySQL
- Verify user permissions: `GRANT ALL PRIVILEGES ON shanghai_tour.* TO 'your_user'@'localhost';`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :5000`
  - Mac/Linux: `lsof -ti:5000 | xargs kill`

### Puppeteer Issues (Web Scraping)
- Puppeteer downloads Chromium automatically
- If issues occur, try: `npm install puppeteer --force`

## Production Deployment

1. Build the frontend:
```bash
cd client
npm run build
cd ..
```

2. Set environment variables on your hosting platform
3. Start the server:
```bash
npm start
```

4. Serve the frontend build from `client/dist` or use a CDN

## Next Steps

1. Add authentication system for admin users
2. Integrate payment gateway (Alipay, WeChat Pay, Stripe)
3. Set up automated event scraping with cron jobs
4. Add image upload functionality
5. Implement order tracking system
6. Add email notifications for orders
