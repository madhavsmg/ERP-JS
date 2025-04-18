// === Basic ERP Backend: Node.js + Express + MongoDB ===

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    params: req.params,
    query: req.query,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('✅ MongoDB Connected');
  console.log('✅ MongoDB Connected');
})
.catch(err => {
  logger.error('MongoDB Connection Error', { error: err });
  console.error('MongoDB Error:', err);
});

// === Schemas and Models ===
const Inventory = mongoose.model('Inventory', new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number
}));

const Sale = mongoose.model('Sale', new mongoose.Schema({
  orderId: String,
  customer: String,
  paymentMode: String,
  items: [
    {
      product: String,
      qty: Number,
      price: Number,
      subtotal: Number
    }
  ],
  total_amount: Number,
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
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    logger.error('Error fetching inventory', { error: err });
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/inventory', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    logger.info('New inventory item added', { item: newItem });
    res.json(newItem);
  } catch (err) {
    logger.error('Error creating inventory item', { error: err });
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

app.put('/inventory/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    logger.info('Inventory item updated', { id: req.params.id, updated });
    res.json(updated);
  } catch (err) {
    logger.error('Error updating inventory item', { id: req.params.id, error: err });
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.delete('/inventory/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    logger.info('Inventory item deleted', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    logger.error('Error deleting inventory item', { id: req.params.id, error: err });
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Sales Routes
app.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    logger.error('Error fetching sales', { error: err });
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/sales', async (req, res) => {
  try {
    const { orderId, customer, paymentMode, items, total_amount } = req.body;

    if (!orderId || !customer || !paymentMode || !Array.isArray(items) || !items.length || !total_amount) {
      return res.status(400).json({ error: "Missing required fields for sale" });
    }

    for (const item of items) {
      if (!item.product || typeof item.qty !== 'number' || typeof item.price !== 'number') {
        return res.status(400).json({ error: "Invalid item structure" });
      }
    }

    const newSale = new Sale({
      orderId,
      customer,
      paymentMode,
      items,
      total_amount
    });

    await newSale.save();
    logger.info('✅ Grouped sale recorded', { orderId, customer, total_amount });
    res.status(201).json(newSale);

  } catch (err) {
    logger.error('❌ Error recording grouped sale', { error: err });
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Expenses Routes
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    logger.error('Error fetching expenses', { error: err });
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/expenses', async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    await newExpense.save();
    logger.info('New expense recorded', { expense: newExpense });
    res.json(newExpense);
  } catch (err) {
    logger.error('Error creating expense', { error: err });
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.put('/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    logger.info('Expense updated', { id: req.params.id, updated });
    res.json(updated);
  } catch (err) {
    logger.error('Error updating expense', { id: req.params.id, error: err });
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    logger.info('Expense deleted', { id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    logger.error('Error deleting expense', { id: req.params.id, error: err });
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Customer Routes
app.get('/customers/all', async (req, res) => {
  try {
    const all = await Customer.find();
    res.json(all);
  } catch (err) {
    logger.error('Error fetching all customers', { error: err });
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/customers/:phoneNumber', async (req, res) => {
  try {
    const customer = await Customer.findOne({ phoneNumber: req.params.phoneNumber });
    res.json(customer);
  } catch (err) {
    logger.error('Error finding customer by phone', { phone: req.params.phoneNumber, error: err });
    res.status(500).json({ error: 'Failed to find customer' });
  }
});

app.post('/customers', async (req, res) => {
  try {
    const { name, phoneNumber, city } = req.body;

    if (!name || !phoneNumber || !city) {
      logger.warn('Incomplete customer data provided', { body: req.body });
      return res.status(400).json({ error: "All fields required" });
    }

    let customer = await Customer.findOne({ phoneNumber });

    if (!customer) {
      customer = new Customer({ name, phoneNumber, city });
      await customer.save();
      logger.info('New customer created', { customer });
    } else {
      logger.info('Existing customer found', { phoneNumber });
    }

    res.json(customer);
  } catch (err) {
    logger.error('Error creating/finding customer', { body: req.body, error: err });
    res.status(500).json({ error: 'Failed to process customer data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled application error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Server start
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🚀 ERP Server running on port ${PORT}`);
});