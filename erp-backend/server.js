// === Basic ERP Backend: Node.js + Express + MongoDB ===

// 1. Setup (run `npm init -y` then install these packages):
// npm install express mongoose cors body-parser dotenv

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('MongoDB Error:', err));

// === Schemas and Models ===
const Inventory = mongoose.model('Inventory', new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number
}));

const Sale = mongoose.model('Sale', new mongoose.Schema({
    product: String,
    qty: Number,
    amount: Number,
    customer: String,
    date: { type: Date, default: Date.now }
  }));
  

const Expense = mongoose.model('Expense', new mongoose.Schema({
  name: String,
  amount: Number
}));

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: String,
    phoneNumber: { type: String, unique: true },
    city: String
  }));

// === Routes ===

// Inventory Routes
app.get('/inventory', async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
});

app.post('/inventory', async (req, res) => {
  const newItem = new Inventory(req.body);
  await newItem.save();
  res.json(newItem);
});

app.put('/inventory/:id', async (req, res) => {
  const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/inventory/:id', async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Sales Routes
app.get('/sales', async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});

app.post('/sales', async (req, res) => {
  const newSale = new Sale(req.body);
  await newSale.save();
  res.json(newSale);
});

// Expenses Routes
app.get('/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

app.post('/expenses', async (req, res) => {
  const newExpense = new Expense(req.body);
  await newExpense.save();
  res.json(newExpense);
});

// Customer Routes
app.get('/customers/all', async (req, res) => {
    const all = await Customer.find();
    res.json(all);
  });
  
  app.get('/customers/:phoneNumber', async (req, res) => {
    const customer = await Customer.findOne({ phoneNumber: req.params.phoneNumber });
    res.json(customer);
  });
  
  app.post('/customers', async (req, res) => {
    const { name, phoneNumber, city } = req.body;
  
    if (!name || !phoneNumber || !city)
      return res.status(400).json({ error: "All fields required" });
  
    let customer = await Customer.findOne({ phoneNumber });
  
    if (!customer) {
      customer = new Customer({ name, phoneNumber, city });
      await customer.save();
    }
  
    res.json(customer);
  });  

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// === .env file example ===
// MONGO_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/erp-app
