// === Frontend Script Connected to Node.js + MongoDB Backend ===

let cart = [];

// === Inventory ===
async function renderInventory() {
  const list = document.getElementById("inventory-list");
  list.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/inventory");
    const inventory = await res.json();

    inventory.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} - Qty: ${p.qty} - ₹${p.price}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load inventory:", err);
  }
}

async function addProduct() {
  const name = document.getElementById("product-name").value;
  const qty = parseInt(document.getElementById("product-qty").value);
  const price = parseFloat(document.getElementById("product-price").value);

  if (!name || isNaN(qty) || isNaN(price)) return alert("Enter valid product, quantity & price");

  try {
    await fetch("http://localhost:5000/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, qty, price })
    });

    document.getElementById("product-name").value = "";
    document.getElementById("product-qty").value = "";
    document.getElementById("product-price").value = "";

    renderInventory();
    updateDashboard();
    populatePOSProducts();
  } catch (err) {
    console.error("Error adding product:", err);
  }
}

// === Expenses ===
async function renderExpenses() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/expenses");
    const expenses = await res.json();

    expenses.forEach(e => {
      const li = document.createElement("li");
      li.textContent = `${e.name} - ₹${e.amount}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load expenses:", err);
  }
}

async function addExpense() {
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);

  if (!name || isNaN(amount)) return alert("Enter valid expense & amount");

  try {
    await fetch("http://localhost:5000/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount })
    });

    document.getElementById("expense-name").value = "";
    document.getElementById("expense-amount").value = "";

    renderExpenses();
    updateDashboard();
  } catch (err) {
    console.error("Error adding expense:", err);
  }
}

// === POS ===
async function populatePOSProducts() {
  const select = document.getElementById("pos-product");
  select.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/inventory");
    const inventory = await res.json();

    inventory.forEach((item, index) => {
      if (item.qty > 0) {
        const option = document.createElement("option");
        option.value = item._id;
        option.textContent = `${item.name} - ₹${item.price} (Qty: ${item.qty})`;
        option.dataset.name = item.name;
        option.dataset.price = item.price;
        select.appendChild(option);
      }
    });
  } catch (err) {
    console.error("Failed to load POS products:", err);
  }
}

function addToCart() {
  const select = document.getElementById("pos-product");
  const selected = select.options[select.selectedIndex];
  const productId = selected.value;
  const name = selected.dataset.name;
  const price = parseFloat(selected.dataset.price);
  const qty = parseInt(document.getElementById("pos-qty").value);

  if (!productId || isNaN(qty) || qty < 1) return alert("Select a product and valid quantity");

  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += qty;
    existing.subtotal = existing.qty * price;
  } else {
    cart.push({ id: productId, name, qty, price, subtotal: qty * price });
  }

  renderCart();
  document.getElementById("pos-qty").value = "";
}

function renderCart() {
  const list = document.getElementById("cart-list");
  list.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty} = ₹${item.subtotal}`;
    list.appendChild(li);
    total += item.subtotal;
  });
  document.getElementById("cart-total").textContent = total;
}

async function completeSale() {
  if (cart.length === 0) return alert("Cart is empty!");

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const city = document.getElementById("customer-city").value.trim();

  if (!phone) return alert("Customer phone number is required");

  const customerRes = await fetch(`http://localhost:5000/customers/${phone}`);
  const customer = await customerRes.json();

  // Case 2 & 3: Already registered
  if (customer && customer.phoneNumber) {
    // Proceed to record sale with customer name
    await finalizeSale(customer.name);
  }
  // Case 1: New customer, all fields required
  else if (name && city) {
    await fetch("http://localhost:5000/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phoneNumber: phone, city })
    });

    await finalizeSale(name);
  } else {
    alert("Customer not found. Please enter full details to complete transaction.");
  }
}

async function finalizeSale(customerName) {
  for (const item of cart) {
    await fetch("http://localhost:5000/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: item.name,
        qty: item.qty,
        amount: item.subtotal,
        customer: customerName
      })
    });
  }

  cart = [];
  renderCart();
  renderInventory();
  updateDashboard();
  populatePOSProducts();
  alert("Sale completed for " + customerName + "!" + " 🙏 Thank you for shopping with us!");
}

// === Customer Lookup ===
async function lookupCustomer() {
  const phone = document.getElementById("customer-phone").value;
  if (!phone) return;

  try {
    const res = await fetch(`http://localhost:5000/customers/${phone}`);
    const customer = await res.json();

    if (customer) {
      document.getElementById("customer-name").value = customer.name;
      document.getElementById("customer-city").value = customer.city;
    } else {
      document.getElementById("customer-name").value = "";
      document.getElementById("customer-city").value = "";
    }
  } catch (err) {
    console.error("Error finding customer:", err);
  }
}

async function saveCustomerIfNeeded() {
  const name = document.getElementById("customer-name").value;
  const phone = document.getElementById("customer-phone").value;
  const city = document.getElementById("customer-city").value;

  if (!phone || !name || !city) return;

  try {
    await fetch("http://localhost:5000/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phoneNumber: phone, city })
    });
  } catch (err) {
    console.error("Error saving customer:", err);
  }
}

async function renderCustomers() {
  try {
    const res = await fetch("http://localhost:5000/customers/all");
    const customers = await res.json();
    const table = document.getElementById("customer-table");
    table.innerHTML = "";

    customers.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${c.name}</td><td>${c.phoneNumber}</td><td>${c.city}</td>`;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load customers:", err);
  }
}


// === Dashboard ===
async function updateDashboard() {
  try {
    const [inventoryRes, salesRes, expensesRes] = await Promise.all([
      fetch("http://localhost:5000/inventory"),
      fetch("http://localhost:5000/sales"),
      fetch("http://localhost:5000/expenses")
    ]);

    const inventory = await inventoryRes.json();
    const sales = await salesRes.json();
    const expenses = await expensesRes.json();

    // Handle both types of sale objects
    let totalSales = 0;
    sales.forEach(sale => {
      if (sale.amount) {
        totalSales += sale.amount;
      } else if (sale.total_amount) {
        totalSales += sale.total_amount;
      }
    });

    let totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    let netProfit = totalSales - totalExpenses;

    document.getElementById("inventory-count").textContent = inventory.length;
    document.getElementById("total-sales").textContent = `₹${totalSales}`;
    document.getElementById("total-expenses").textContent = `₹${totalExpenses}`;
    document.getElementById("net-profit").textContent = `₹${netProfit}`;

  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
}


// === Section Navigation ===
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
  if (id === 'customers') renderCustomers();
}


// === Init ===
renderInventory();
renderExpenses();
renderCart();
updateDashboard();
populatePOSProducts();