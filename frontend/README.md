# RMC Plant Inventory Management System - Frontend

Pure HTML, CSS, and JavaScript frontend for the RMC Plant Inventory Management System.

## Features

- 🔐 User Authentication (Admin & Operator roles)
- 📦 Material Inventory Management
- 📊 Stock In/Out Transactions
- 🏭 Supplier Management
- 📈 Comprehensive Reports & Analytics
- ⚠️ Low Stock Alerts
- 📱 Fully Mobile Responsive
- 🌙 Dark Mode Design

## Setup Instructions

1. **Start the Python Backend**
   - Navigate to the `backend` folder
   - Run `python main.py`
   - Backend will run on `http://localhost:8000`

2. **Serve the Frontend**
   - You can use any static file server. Options:
   
   **Option A: Python HTTP Server**
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   
   **Option B: Node.js HTTP Server**
   ```bash
   cd frontend
   npx http-server -p 8080
   ```
   
   **Option C: VS Code Live Server Extension**
   - Right-click on `index.html` and select "Open with Live Server"

3. **Access the Application**
   - Open your browser and go to `http://localhost:8080`
   - Login with default credentials:
     - Admin: `admin` / `admin123`
     - Operator: `operator` / `operator123`

## File Structure

```
frontend/
├── index.html           # Login page
├── dashboard.html       # Dashboard overview
├── inventory.html       # Material inventory
├── transactions.html    # Stock transactions
├── suppliers.html       # Supplier management
├── reports.html         # Reports & analytics
├── alerts.html          # Low stock alerts
├── styles.css          # Main stylesheet
├── api.js              # API communication layer
├── app.js              # Common app functions
├── auth.js             # Authentication logic
├── dashboard.js        # Dashboard page logic
├── inventory.js        # Inventory page logic
├── transactions.js     # Transactions page logic
├── suppliers.js        # Suppliers page logic
├── reports.js          # Reports page logic
└── alerts.js           # Alerts page logic
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Fetch API** - For REST API communication
- **LocalStorage** - For session management

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Features by Role

### Admin
- Full access to all features
- Add, edit, delete materials
- Add, edit, delete suppliers
- Record transactions
- View all reports and alerts

### Operator
- View inventory
- Record transactions
- View reports and alerts
- Cannot modify materials or suppliers

## API Endpoints Used

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /materials` - Get all materials
- `POST /materials` - Create material
- `PUT /materials/{id}` - Update material
- `DELETE /materials/{id}` - Delete material
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create transaction
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create supplier
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier
- `GET /alerts/low-stock` - Get low stock alerts
