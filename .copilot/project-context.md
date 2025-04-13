# Project: Retail ERP for Siva Sai Enterprises

## Stack
- **Frontend**: Vanilla JS (index.html, script.JS, style.CSS)
- **Backend**: Node.js + Express (server.js)
- **Database**: MongoDB Atlas (via .env MONGO_URI)

## Modules
- **Inventory Management**: Add, update, delete inventory items.
- **POS (Point of Sale)**: Cart operations, checkout, and customer info collection.
- **Expense Tracking**: Add and list business expenses.
- **Customer CRM**: Register new customers, lookup by phone, view all customers.
- **Dashboard**: Displays inventory count, total sales, total expenses, and net profit in real-time.

## Usage Flow
- The cashier selects products from POS and enters quantity.
- Customer provides phone number → lookup in the CRM.
    - If new: All fields (Name, Phone, City) are required to complete the transaction.
    - If existing: Phone is enough to retrieve data.
- Sale is recorded under that customer.
- Inventory updates the stock, expenses are tracked, and dashboard reflects totals.

## Enhancements Planned
- Reporting module for sales analytics
- Export options for inventory and expenses
- Admin login and role-based access