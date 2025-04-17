# 🧾 Siva Sai Enterprises - Retail ERP System

A lightweight full-stack ERP application for a retail store.

> 📦 Inventory | 🛒 POS | 👥 Customers | 💵 Expenses | 📄 Sales History | 📊 Dashboard

---

## 🧱 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS  
- **Backend**: Node.js + Express  
- **Database**: MongoDB (Atlas)  
- **Logger**: Winston

---

## 🎯 Features

### 🗃 Inventory Management
- Add, edit, and delete products
- View full inventory list with quantity and price

### 🛒 Point of Sale (POS)
- Add items to cart from dropdown
- Auto-lookup or register customers
- Calculate total and complete sale
- **Automatically reduce inventory stock** after sale

### 👥 Customer CRM
- Lookup customers by phone number
- Register new customers (Name, Phone, City)
- View all customers in a table
- **Delete customer entries**

### 💵 Expense Tracker
- Add expenses with name and amount
- Real-time update in dashboard calculations

### 📄 Sales History
- View complete list of past sales
- Includes date, customer, product, qty, and amount

### 📊 Live Dashboard
- Inventory count
- Total sales
- Total expenses
- Net profit

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas URI (Account with API)
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

1. **🗃 Inventory Management**  
   - Add new products by specifying name, quantity, and price  
   - View all products in the inventory list  
   - Use ✏️ to edit product details or 🗑️ to delete items  
   - Changes reflect immediately in the POS product dropdown and dashboard  

2. **🛒 POS Operations (Point of Sale)**  
   - Select a product from the dropdown (only in-stock items shown)  
   - Enter quantity and add it to the cart  
   - Repeat to add multiple products to the same cart  
   - Enter **customer phone number**:  
     - If found, customer name and city (will be fetched and auto-filled)  
     - If not found, Should fill all 3 fields: Name, Phone, City  
   - Complete the sale to:  
     - Record each product sale  
     - Deduct sold quantity from inventory  
     - Save/update customer details  
     - Update dashboard metrics (total sales, profit)

3. **👥 Customer Management**  
   - View all customers in a structured table (Name, Phone, City)  
   - Use 🗑️ to delete customers as needed  
   - Customer auto-detection happens via phone number at checkout

4. **💵 Expense Tracking**  
   - Add expenses with a description and amount  
   - All expenses show in a live-updated list  
   - Dashboard immediately reflects expense totals and net profit

5. **📄 Sales History**  
   - View a tabular list of all past sales  
   - Each row shows: Sale Date, Customer, Product, Quantity, Amount  
   - Helps with manual bookkeeping or future reporting

6. **📊 Dashboard Monitoring**  
   - Displays real-time stats at the top of the page:  
     - 📦 Inventory Count  
     - 💰 Total Sales  
     - 🧾 Total Expenses  
     - 📈 Net Profit  
   - Automatically updates with every sale, inventory change, or expense entry

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
| `/sales` | GET | Get all sales history | N/A | Array of sale objects with product, qty, amount, customer, and date |
| `/sales` | POST | Record a sale (auto-updates inventory) | `{ "product": "Item Name", "qty": 2, "amount": 199.98, "customer": "John Doe" }` | Created sale object with date |
| `/expenses` | GET | Get all recorded expenses | N/A | Array of expense objects with name and amount |
| `/expenses` | POST | Add new expense entry | `{ "name": "Electricity", "amount": 1200 }` | Created expense object |
| `/customers/all` | GET | Get all customers | N/A | Array of customer objects with name, phoneNumber, and city |
| `/customers/:phoneNumber` | GET | Find customer by phone number | N/A | Customer object if found, else null |
| `/customers/:phoneNumber` | DELETE | Delete a customer by phone | N/A | `{ "message": "Deleted" }` |
| `/customers` | POST | Add or update customer | `{ "name": "John Doe", "phoneNumber": "1234567890", "city": "New York" }` | Newly created or matched customer object |

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