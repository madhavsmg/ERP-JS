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
      li.innerHTML = `
        ${p.name} - Qty: ${p.qty} - ₹${p.price}
        <button onclick="editProduct('${p._id}', '${p.name}', ${p.qty}, ${p.price})">✏️</button>
        <button onclick="deleteProduct('${p._id}')">🗑️</button>
      `;
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

function editProduct(id, name, qty, price) {
  const newName = prompt("New name:", name);
  const newQty = prompt("New quantity:", qty);
  const newPrice = prompt("New price:", price);

  if (!newName || isNaN(newQty) || isNaN(newPrice)) return alert("Invalid input.");

  fetch(`http://localhost:5000/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, qty: Number(newQty), price: Number(newPrice) })
  }).then(() => {
    renderInventory();
    updateDashboard();
    populatePOSProducts();
  });
}

function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    fetch(`http://localhost:5000/inventory/${id}`, {
      method: "DELETE"
    }).then(() => {
      renderInventory();
      updateDashboard();
      populatePOSProducts();
    });
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

    inventory.forEach(item => {
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

  if (customer && customer.phoneNumber) {
    await finalizeSale(customer.name);
  } else if (name && city) {
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
  alert(`Sale completed for ${customerName}! 🙏`);
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

async function renderCustomers() {
  try {
    const res = await fetch("http://localhost:5000/customers/all");
    const customers = await res.json();
    const table = document.getElementById("customer-table");
    table.innerHTML = "";

    customers.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.name}</td>
        <td>${c.phoneNumber}</td>
        <td>${c.city}</td>
        <td><button onclick="deleteCustomer('${c.phoneNumber}')">🗑️</button></td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load customers:", err);
  }
}

async function deleteCustomer(phoneNumber) {
  if (confirm("Delete this customer?")) {
    try {
      await fetch(`http://localhost:5000/customers/${phoneNumber}`, { method: "DELETE" });
      renderCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  }
}

// === Sales View ===
async function renderSales() {
  try {
    const res = await fetch("http://localhost:5000/sales");
    const sales = await res.json();
    const table = document.getElementById("sales-table");
    table.innerHTML = "";

    sales.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(s.date).toLocaleString()}</td>
        <td>${s.customer}</td>
        <td>${s.product}</td>
        <td>${s.qty}</td>
        <td>₹${s.amount}</td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load sales:", err);
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

    let totalSales = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
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
  if (id === 'sales') renderSales();
}

// === Init ===
renderInventory();
renderExpenses();
renderCart();
updateDashboard();
populatePOSProducts();
