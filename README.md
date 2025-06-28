# Marketplace API - TypeScript Version

A unified marketplace API that integrates with multiple vendors (eCommerce and Voucher providers) built with TypeScript, Express.js, and modern development practices.

## 🚀 Features

- **Multi-vendor support**: Integrates with eCommerce and Voucher vendors
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Unified API**: Single API interface for multiple vendor types
- **Authentication**: JWT-based authentication for eCommerce vendor
- **Encryption**: AES-256-CBC encryption for Voucher vendor
- **Rate Limiting**: Built-in rate limiting for API protection
- **CORS Support**: Configurable CORS settings
- **Request Validation**: Input validation using Joi
- **Error Handling**: Comprehensive error handling and logging
- **Development Tools**: Hot reload with nodemon and ts-node

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

## 🏃‍♂️ Running the Application

### Development Mode (TypeScript)
```bash
# Run with hot reload
npm run dev:watch

# Or run without hot reload
npm run dev
```

### Production Mode
```bash
# Build TypeScript to JavaScript
npm run build

# Start the built application
npm start
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run TypeScript directly with ts-node
- `npm run dev:watch` - Run with nodemon for hot reload
- `npm start` - Start the compiled JavaScript application
- `npm run clean` - Remove the dist folder
- `npm test` - Run tests

## 📁 Project Structure

```
marketplace-api/
├── src/
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── interfaces/
│   │   └── VendorInterface.ts # Abstract vendor interface
│   ├── vendors/
│   │   ├── EcomVendor.ts     # eCommerce vendor implementation
│   │   └── VoucherVendor.ts  # Voucher vendor implementation
│   ├── factories/
│   │   └── VendorFactory.ts  # Vendor factory pattern
│   ├── controllers/
│   │   └── MarketplaceController.ts # API controllers
│   ├── routes/
│   │   └── marketplace.ts    # API routes
│   └── index.ts              # Main application file
├── dist/                     # Compiled JavaScript (after build)
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🔌 API Endpoints

### Base URL: `http://localhost:3000`

#### Products
- `GET /api/v1/marketplace/products?vendor=<ecom|voucher>`
  - Get products from specified vendor
  - Query parameters: `vendor`, `query`, `type`, `category`, `rx_required`

#### Inventory Validation
- `POST /api/v1/marketplace/validate-inventory`
  - Validate inventory across vendors
  - Body: Array of items with sku, quantity, vendor, denomination

#### Orders
- `POST /api/v1/marketplace/order?vendor=<ecom|voucher>`
  - Place order with specified vendor
  - Body: Order data with items, customer info, payment info

#### Vendors
- `GET /api/v1/marketplace/vendors`
  - Get list of supported vendors

#### Health Check
- `GET /api/v1/marketplace/health`
  - API health check endpoint

## 🔧 Configuration

Environment variables in `.env`:

```env
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🏗️ Architecture

### Vendor Interface Pattern
All vendors implement the `VendorInterface` abstract class, ensuring consistent API across different vendor types.

### Factory Pattern
The `VendorFactory` manages vendor instances using the singleton pattern for performance optimization.

### Type Safety
Full TypeScript implementation with:
- Strict type checking
- Interface definitions for all data structures
- Generic types for API responses
- Type-safe request/response handling

### Error Handling
- Global error handler with proper HTTP status codes
- Vendor-specific error handling
- Development vs production error responses

## 🧪 Testing

```bash
npm test
```


## 🚀 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Start the application:
   ```bash
   npm start
   ```





