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
├── abstract-flat-background-img.jpg  # Background image
├── circle logo ss tea.png            # Logo image
├── erp_flowchart.png                 # Flowchart image
└── README.md           # This documentation
```

## 🛣️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory` | GET | Get all inventory items |
| `/inventory` | POST | Add new inventory item |
| `/inventory/:id` | PUT | Update inventory item |
| `/inventory/:id` | DELETE | Delete inventory item |
| `/sales` | GET | Get all sales |
| `/sales` | POST | Add new sale |
| `/expenses` | GET | Get all expenses |
| `/expenses` | POST | Add new expense |
| `/customers/all` | GET | Get all customers |
| `/customers/:phoneNumber` | GET | Find customer by phone number |
| `/customers` | POST | Add or update customer |

## 🔜 Planned Enhancements
- Reporting module for sales analytics
- Export options for inventory and expenses
- Admin login and role-based access

## 📝 License
[MIT](LICENSE)