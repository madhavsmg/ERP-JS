# 🧾 Siva Sai Enterprises - Retail ERP

This is a lightweight full-stack ERP application for a retail store built using:

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)

## 🎯 Features

### 🗃 Inventory Management
- Add products with name, quantity, and price
- Display and update inventory list

### 🛒 POS (Point of Sale)
- Select product and quantity
- Add to cart and complete sale
- Link each sale to a customer (new or existing)

### 👥 Customer CRM
- Auto-lookup by phone number
- Register new customers (Name, Phone, City)
- View all customers in a table

### 💵 Expense Management
- Track expenses by name and amount
- Update finance dashboard with real-time profit calculation

### 📊 Dashboard
- View inventory count
- Calculate and show total sales, expenses, and net profit

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git (optional)

### Installation

1. Clone this repo
```bash
git clone https://github.com/yourusername/retail-erp.git
cd retail-erp
```

2. Install backend dependencies
```bash
cd erp-backend
npm install
```

3. Configure MongoDB connection
   - Create `.env` file in the `erp-backend` directory
   - Add your MongoDB Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
   ```

4. Start the backend server
```bash
node server.js
```

5. Open `index.html` in a web browser or use a simple HTTP server
```bash
# Using Node's http-server (install with: npm install -g http-server)
cd ..  # Go back to project root
http-server
```

## 📋 Usage Flow

1. **Inventory Management**: Add products to inventory
2. **POS Operations**:
   - Select product from dropdown and quantity
   - Add products to cart
   - Enter customer phone number (system will auto-lookup existing customers)
   - For new customers, fill in all required fields (Name, Phone, City)
   - Complete the sale
3. **Track Finances**:
   - Record business expenses
   - Dashboard will update with real-time calculations

## 🧩 Project Structure

```
/
├── frontend/           # Frontend folder
│   ├── index.html      # Main application HTML
│   ├── script.js       # Frontend JavaScript
│   └── style.css       # Styling
├── erp-backend/        # Backend folder
│   ├── server.js       # Express server & MongoDB models
│   ├── package.json    # Dependencies
│   └── .env            # Environment variables (create this file)
c├── abstract-flat-background-img.jpg  # Background image
├── circle logo ss tea.png            # Logo image
├── erp_flowchart.png                 # Flowchart image
└── README.md           # This documentation
```

## 🛣️ API Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/inventory` | GET | Get all inventory items | N/A | Array of inventory objects with name, qty, and price |
| `/inventory` | POST | Add new inventory item | `{ "name": "Item Name", "qty": 10, "price": 99.99 }` | Created inventory object with MongoDB ID |
| `/inventory/:id` | PUT | Update inventory item | `{ "name": "Updated Name", "qty": 5, "price": 49.99 }` | Updated inventory object |
| `/inventory/:id` | DELETE | Delete inventory item | N/A | `{ "message": "Deleted" }` |
| `/sales` | GET | Get all sales | N/A | Array of sale objects with product, qty, amount, customer, and date |
| `/sales` | POST | Add new sale | `{ "product": "Item Name", "qty": 2, "amount": 199.98, "customer": "customerId" }` | Created sale object with auto date |
| `/expenses` | GET | Get all expenses | N/A | Array of expense objects with name and amount |
| `/expenses` | POST | Add new expense | `{ "name": "Rent", "amount": 1000 }` | Created expense object |
| `/customers/all` | GET | Get all customers | N/A | Array of customer objects with name, phoneNumber, and city |
| `/customers/:phoneNumber` | GET | Find customer by phone number | N/A | Customer object or null if not found |
| `/customers` | POST | Add or update customer | `{ "name": "John Doe", "phoneNumber": "1234567890", "city": "New York" }` | Created/found customer object |

## 📊 Logging

The application uses Winston for logging with the following features:

- **Console Logging**: All logs are printed to the console with colorized output
- **File Logging**: 
  - All logs are saved to `logs/combined.log`
  - Error-level logs are saved to `logs/error.log`
- **Log Rotation**: Log files are automatically rotated when they reach 5MB
- **Log Levels**: The logging level can be configured in the `.env` file with `LOG_LEVEL`

### Log Example

```json
{"level":"info","message":"GET /inventory","ip":"::1","params":{},"query":{},"service":"erp-backend","timestamp":"2025-04-12 10:15:23"}
```

### Configuration

In your `.env` file, you can set:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
LOG_LEVEL=info   # Set to debug, info, warn, or error
```

## 🔜 Planned Enhancements
- Reporting module for sales analytics
- Export options for inventory and expenses
- Admin login and role-based access

## 📝 License
[MIT](LICENSE)