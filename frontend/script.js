let cart = [];

// ----------------------------------
// ============ Inventory ===========
// ----------------------------------

async function renderInventory() {
  const list = document.getElementById("inventory-list");
  list.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/inventory");
    const inventory = await res.json();

    inventory.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.qty}</td>
        <td>₹${p.price}</td>
        <td>
          <button onclick="editProduct('${p._id}', '${p.name}', ${p.qty}, ${p.price})">✏️</button>
          <button onclick="deleteProduct('${p._id}')">🗑️</button>
        </td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load inventory:", err);
  }
}


async function addProduct() {
  const name = document.getElementById("product-name").value;
  const qty = parseInt(document.getElementById("product-qty").value);
  const price = parseFloat(document.getElementById("product-price").value);

  if (!name || isNaN(qty) || isNaN(price) || qty < 0 || price < 0) return alert("Enter valid, non-negative values.");

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
  if (newName === null) return; // Cancelled

  const newQty = prompt("New quantity:", qty);
  if (newQty === null) return;

  const newPrice = prompt("New price:", price);
  if (newPrice === null) return;

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

// ---------------------------------
// ============ Expenses ===========
// ---------------------------------

async function renderExpenses() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/expenses");
    const expenses = await res.json();

    expenses.forEach(e => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${e.name}</td>
        <td>₹${e.amount}</td>
        <td>
          <button onclick="editExpense('${e._id}', '${e.name}', ${e.amount})">✏️</button>
          <button onclick="deleteExpense('${e._id}')">🗑️</button>
        </td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load expenses:", err);
  }
}

async function addExpense() {
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);

  if (!name || isNaN(amount) || amount < 0) return alert("Enter valid non-negative amount");

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

function editExpense(id, name, amount) {
  const newName = prompt("Update expense name:", name);
  if (newName === null) return;

  const newAmount = prompt("Update amount:", amount);
  if (newAmount === null) return;

  if (!newName || isNaN(newAmount)) return alert("Invalid input.");

  fetch(`http://localhost:5000/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, amount: parseFloat(newAmount) })
  }).then(() => {
    renderExpenses();
    updateDashboard();
  });
}

function deleteExpense(id) {
  if (confirm("Delete this expense?")) {
    fetch(`http://localhost:5000/expenses/${id}`, {
      method: "DELETE"
    }).then(() => {
      renderExpenses();
      updateDashboard();
    });
  }
}

// ----------------------------------
// =============== POS ==============
// ----------------------------------

async function populatePOSProducts() {
  const select = document.getElementById("pos-product");
  select.innerHTML = `<option value="" disabled selected hidden>-- Select a Product --</option>`;

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
        option.dataset.qty = item.qty;
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
  if (!selected || !selected.value) return alert("Please select a valid product.");

  const productId = selected.value;
  const name = selected.dataset.name;
  const price = parseFloat(selected.dataset.price);
  const availableQty = parseInt(selected.dataset.qty);
  const qty = parseInt(document.getElementById("pos-qty").value);

  if (isNaN(qty) || qty < 1) return alert("Enter a valid quantity");

  const existing = cart.find(c => c.id === productId);
  const currentQtyInCart = existing ? existing.qty : 0;

  if (qty + currentQtyInCart > availableQty) {
    return alert(`❌ Not enough stock! Only ${availableQty - currentQtyInCart} more unit(s) available for ${name}.`);
  }

  if (existing) {
    existing.qty += qty;
    existing.subtotal = existing.qty * price;
  } else {
    cart.push({ id: productId, name, qty, price, subtotal: qty * price });
  }

  renderCart();
  document.getElementById("pos-qty").value = "";
  document.getElementById("pos-product").value = "";
}

function renderCart() {
  const tbody = document.getElementById("cart-list");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₹${item.price}</td>
      <td>${item.qty}</td>
      <td>₹${item.subtotal}</td>
    `;
    tbody.appendChild(row);
    total += item.subtotal;
  });

  document.getElementById("cart-total").textContent = total;
}

async function completeGroupedSale() {
  if (cart.length === 0) return alert("Cart is empty!");

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const city = document.getElementById("customer-city").value.trim();

  if (!phone) return alert("Customer phone number is required");

  try {
    const customerRes = await fetch(`http://localhost:5000/customers/${phone}`);
    let customer = await customerRes.json();

    if (!customer || !customer.phoneNumber) {
      if (!name || !city) return alert("New customer: Name and City are required.");
      customer = { name, phoneNumber: phone, city }; // 💡 set correctly before sending to backend
      await fetch("http://localhost:5000/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber: phone, city })
      });

      // Re-fetch the full customer data (ensure backend returns saved object)
      const updatedCustomerRes = await fetch(`http://localhost:5000/customers/${phone}`);
      customer = await updatedCustomerRes.json();
    }
    
    const orderId = "ORD" + Date.now();
    const paymentMode = document.getElementById("payment-mode").value;
    if (!paymentMode) return alert("Please select a payment method!");

    const items = cart.map(item => ({
      product: item.name,
      qty: item.qty,
      price: item.price,
      subtotal: item.subtotal
    }));

    const total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const confirmMsg = `Confirm sale for ${customer.name} with ${items.length} items totaling ₹${total_amount}?`;
    if (!confirm(confirmMsg)) return;

    const res = await fetch("http://localhost:5000/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        customer: customer.name,
        paymentMode,
        items,
        total_amount
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert("❌ Error: " + err.error);
      return;
    }

    cart = [];
    renderCart();
    updateDashboard();
    alert("✅ Sale completed successfully!");
    document.getElementById("payment-mode").value = "";
    document.getElementById("customer-name").value = "";
    document.getElementById("customer-phone").value = ""; 
    document.getElementById("customer-city").value = "";
  } catch (err) {
    console.error("❌ Error in completeGroupedSale:", err);
    alert("Something went wrong while completing the sale.");
  }
}

// === Fetch Customer Info Button ===
async function fetchCustomer() {
  const phone = document.getElementById("customer-phone").value.trim();
  if (!phone) return alert("Please enter a phone number first.");

  try {
    const res = await fetch(`http://localhost:5000/customers/${phone}`);
    const customer = await res.json();

    if (customer && customer.name) {
      // alert(`Customer found: ${customer.name}, ${customer.city}`);
      document.getElementById("customer-name").value = customer.name;
      document.getElementById("customer-city").value = customer.city;
    } else {
      alert("Customer not found. Please fill in name and city to register.");
      document.getElementById("customer-name").value = "";
      document.getElementById("customer-city").value = "";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error checking customer info.");
  }
}

// ----------------------------------
// ============ Customer ============
// ----------------------------------

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
        <td>
          <button onclick="updateCustomer('${c.phoneNumber}', '${c.name}', '${c.city}')">✏️</button>
          <button onclick="deleteCustomer('${c.phoneNumber}')">🗑️</button>
        </td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load customers:", err);
  }
}

async function addCustomer() {
  const name = document.getElementById("new-customer-name").value.trim();
  const phone = document.getElementById("new-customer-phone").value.trim();
  const city = document.getElementById("new-customer-city").value.trim();

  if (!name || !phone || !city) return alert("All fields are required.");

  try {
    await fetch("http://localhost:5000/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phoneNumber: phone, city })
    });

    document.getElementById("new-customer-name").value = "";
    document.getElementById("new-customer-phone").value = "";
    document.getElementById("new-customer-city").value = "";
    renderCustomers();
  } catch (err) {
    console.error("Error adding customer:", err);
    alert("Failed to add customer.");
  }
}

async function updateCustomer(phone, oldName, oldCity) {
  const newName = prompt("Update name:", oldName);
  if (newName === null) return;

  const newCity = prompt("Update city:", oldCity);
  if (newCity === null) return;

  try {
    await fetch(`http://localhost:5000/customers/${phone}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, city: newCity })
    });
    renderCustomers();
    alert("✅ Customer updated successfully!");
  } catch (err) {
    console.error("Error updating customer:", err);
    alert("Failed to update customer.");
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

// ----------------------------------
// ============== Sales =============
// ----------------------------------

async function renderSales() {
  try {
    const res = await fetch("http://localhost:5000/sales");
    const sales = await res.json();
    const table = document.getElementById("sales-table");
    table.innerHTML = "";

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(sale.date).toLocaleString()}</td>
          <td>${sale.customer || 'N/A'}</td>
          <td>${item.product}</td>
          <td>${item.qty}</td>
          <td>₹${item.subtotal}</td>
        `;
        table.appendChild(row);
      });
    });
  } catch (err) {
    console.error("Failed to load sales:", err);
  }
}

// ----------------------------------
// ============ Dashboard ===========
// ----------------------------------

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

    let totalSales = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    let totalExpenses = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    let netProfit = totalSales - totalExpenses;

    document.getElementById("inventory-count").innerHTML = `📦 Inventory: ${inventory.length}`;
    document.getElementById("total-sales").innerHTML = `💰 Total Sales: ₹${totalSales}`;
    document.getElementById("total-expenses").innerHTML = `🧾 Expenses: ₹${totalExpenses}`;
    document.getElementById("net-profit").innerHTML = `📈 Net Profit: ₹${netProfit}`;
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
}

// === Section Navigation ===
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";

  // Render specific content
  if (id === 'dashboard') updateDashboard();
  if (id === 'inventory') renderInventory();
  if (id === 'finance') renderExpenses();
  if (id === 'pos') populatePOSProducts();
  if (id === 'customers') renderCustomers();
  if (id === 'sales') renderSales();
}

// === Init on Load ===
showSection('dashboard');
renderCart(); // POS cart needs init for all cases