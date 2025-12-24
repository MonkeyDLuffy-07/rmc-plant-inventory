# RMC Plant Inventory - Python Backend API

This is the Python FastAPI backend for the RMC Plant Inventory Management System.

## Features

- RESTful API with FastAPI
- SQLite database with SQLAlchemy ORM
- Automatic API documentation (Swagger UI)
- CORS enabled for Next.js frontend
- Authentication endpoints
- Complete CRUD operations for Materials, Transactions, and Suppliers
- Automatic low stock alerts

## Installation

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

The API will be available at: `http://localhost:8000`

API Documentation (Swagger UI): `http://localhost:8000/docs`

## Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Operator**: username: `operator`, password: `operator123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/{id}` - Get material by ID
- `POST /api/materials` - Create new material
- `PUT /api/materials/{id}` - Update material
- `DELETE /api/materials/{id}` - Delete material

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction (auto-updates stock)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/{id}` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Alerts
- `GET /api/alerts` - Get low stock alerts

## Database

The application uses SQLite database (`rmc_inventory.db`) which will be created automatically on first run with sample data.

## Development

- The database is automatically initialized with sample materials, suppliers, and users on first run
- CORS is configured to allow requests from `http://localhost:3000` (Next.js dev server)
- All API endpoints return JSON responses
