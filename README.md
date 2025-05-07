
# Beverage Order System

A full-stack web application for managing beverage orders and inventory.

## Features

- User Authentication (Customer & Stockist roles)
- Product Catalog with Categories
- Shopping Cart Management  
- Order Creation & Tracking
- VAT Receipt Generation
- Stockist Dashboard
- Inventory Management
- Real-time Order Status Updates

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: In-memory store (can be extended to PostgreSQL)
- UI Components: Radix UI + TailwindCSS
- State Management: React Query + Context
- Routing: Wouter

## Project Structure

```
beverage.A1/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utility functions
│   │   ├── pages/     # Page components
│   │   └── App.tsx    # Root component
├── server/             # Backend Express application
│   ├── routes/        # API route handlers
│   ├── auth.ts        # Authentication logic
│   └── storage.ts     # Data storage implementation
└── shared/            # Shared TypeScript types/schemas
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port number (default: 5000)
- `JWT_SECRET` - Secret key for JWT authentication

## API Routes

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - User login
- GET `/api/user` - Get current user

### Beverages
- GET `/api/beverages` - List all beverages
- GET `/api/beverages/:id` - Get beverage details

### Orders
- POST `/api/orders` - Create new order
- GET `/api/orders` - List user orders
- GET `/api/orders/:id` - Get order details

### Stockist
- GET `/api/stockist/inventory` - Get stockist inventory
- PATCH `/api/stockist/inventory/:id` - Update inventory item
- GET `/api/stockist/orders` - Get assigned orders
- PATCH `/api/stockist/orders/:id` - Update order status

## License

MIT License
