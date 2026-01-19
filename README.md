# Shanghai Tour Guide App

A comprehensive shopping and tourism information app designed for foreigners visiting Shanghai.

## Features

1. **Souvenir Shopping Locations**: Information about where to buy souvenirs offline and available varieties
2. **Online Shopping with Drop-shipping**: 
   - Users can purchase items from the app
   - Orders are fulfilled via Taobao/Pinduoduo on behalf of users
   - Express delivery service available for additional shipping fees
3. **Events & Exhibitions**: Curated information about Shanghai events, exhibitions, and activities scraped from SmartShanghai and other platforms

## Tech Stack

- **Backend**: Node.js + Express + Sequelize
- **Frontend**: React + Vite (Web-based)
- **Web Scraping**: Puppeteer
- **Database**: MySQL

## Project Structure

```
tour/
├── server/              # Backend API
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── controllers/    # Business logic
│   ├── scrapers/       # Data scraping services
│   └── middleware/     # Express middleware
├── client/             # Frontend React app
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── styles/     # CSS/styling
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v5.7 or higher, local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend dev server (port 5173).

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shanghai_tour
DB_USER=root
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (admin)

### Shopping Locations
- `GET /api/locations` - Get all souvenir shopping locations
- `GET /api/locations/:id` - Get location by ID

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/refresh` - Refresh events from scrapers (admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/user/:userId` - Get user orders

## License

MIT
