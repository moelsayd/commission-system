```markdown
# 🛒 Commission & Inventory Management System

A full-featured, offline-capable web application for managing sales, purchases, inventory, and commissions. Built with **Flask**, **SQLite**, and a clean Arabic UI, it works flawlessly on desktop and mobile (PWA). The system supports data export to Excel/PDF and is designed for individual entrepreneurs or small teams who need a reliable local tool to track customers, orders, products, suppliers, payments, and commissions – all without an internet connection once deployed.

---

## 📂 Project Structure

```
* **
commission-system/
├── app.py                 # Flask application (API & business logic)
├── config.py              # Configuration (paths, secrets)
├── database.py            # Database connection & schema creation
├── models.py              # SQLAlchemy models (optional, may be unused)
├── database.db            # SQLite database file (auto-created)
├── database.sql           # SQLite dump / raw schema backup
├── requirements.txt       # Python dependencies
├── runtime.txt            # Python runtime spec (for deployment)
├── Procfile               # Process file (Heroku / similar)
├── buildozer.md           # Instructions for Android APK build
├── static/
│   ├── css/
│   │   └── style.css      # Responsive CSS with Grid & Flexbox
│   ├── js/
│   │   └── main.js        # Frontend logic (AJAX, toast, pagination)
│   ├── sw.js              # Service Worker (PWA – optimized for dynamic data)
│   ├── manifest.json      # PWA manifest
│   └── icon-192.png       # App icon
└── templates/
├── base.html          # Main layout (sidebar + content)
├── login.html         # Login page
├── dashboard.html     # Dashboard
├── customers.html     # Customers
├── products.html      # Products
├── orders.html        # Orders
├── suppliers.html     # Suppliers
├── purchases.html     # Purchases
├── payments.html      # Payments
├── commissions.html   # Commissions
├── reports.html       # Reports
├── activity_logs.html # Activity logs
└── settings.html      # Settings
* **
```

---

## ⚙️ Requirements

- **Python 3.9+**
- **Flask** (and the packages listed in `requirements.txt`)
- A modern web browser (Chrome, Firefox, Edge)

---

## 🚀 Quick Start

1. **Clone the repository** (or copy all files into a directory):
   ```bash
   git clone https://github.com/Shinigami/commission-system.git
   cd commission-app
```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate      # Linux/macOS
   venv\Scripts\activate         # Windows
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   python app.py
   ```
   The app will start at http://127.0.0.1:5000 (and on the local network via 0.0.0.0).
5. Login with the default credentials:
   · Username: admin
   · Password: admin
   ⚠️ Important: Change the default password immediately from the Settings page.

---

🧩 Key Features

🔐 Authentication & Sessions

· Default admin account with the ability to change the password.
· Secure sessions with HTTPOnly and SameSite cookie attributes.
· API endpoints are protected; unauthorized requests receive a 401 JSON response instead of a redirect, preventing frontend loops.

👥 Customers

· Full CRUD (create, read, update, delete) with search, sort, and pagination.
· Prevent deletion of customers that have associated orders.

📦 Products & Inventory

· Manage product name, description, buy price, sell price, and stock quantity.
· Low-stock alerts (products below the configurable threshold).
· Automatically increase/decrease stock on purchases and orders.
· Prevent deletion of products used in orders or purchases.

🛒 Orders

· Create orders with multiple items, each with quantity and unit price.
· Automatic calculation of total amount and commission (percentage‑based).
· Stock deduction upon order creation; stock restored when an order is cancelled or deleted.
· Order statuses: pending → confirmed → shipping → delivered → cancelled.
· When an order is marked as delivered and fully paid, its revenue and commission are counted in the dashboard.
· View paid amount and remaining balance for each order.

💰 Payments

· Record customer payments for specific orders (validates that the amount does not exceed the remaining balance).
· Record supplier payments (optionally linked to a purchase).
· All payment operations are logged.

🤝 Suppliers & Purchases

· Manage supplier information.
· Record purchases – automatically increases product stock.
· Deletion of a purchase is only allowed if no related payments exist and the current stock covers the purchase quantity.

💸 Commissions

· View all orders along with their commission percentage and amount.

📈 Dashboard

· Real‑time statistics:
  · Number of customers, products, total orders, active orders.
  · Total sales and total commissions (only for delivered and fully paid orders).
  · Low‑stock products count.
  · Total payments received from customers and paid to suppliers.
  · Last 5 orders.

📊 Reports & Export

· Monthly sales report (count and total for completed orders).
· List of low‑stock products.
· Export data (customers or orders) to:
  · CSV (UTF‑8 with BOM for Arabic support)
  · Excel (.xlsx)
  · PDF

📜 Activity Log

· Every create/update/delete operation on any entity is recorded with timestamp and details.

📱 Progressive Web App (PWA)

· Can be installed on mobile or desktop for an app‑like experience.
· Service Worker caches only static assets (style.css, main.js, icons); API responses and dynamic pages are never cached, ensuring always‑fresh data.

---

🔧 Converting to an Android APK

The project can be turned into a standalone Android app that works completely offline using one of two approaches:

1. Chaquopy + WebView – Embed the Python runtime and Flask server inside an Android app, then display the UI via a WebView. This is the fastest way to get an APK without rewriting the backend.
2. Native Android Room Database – Rebuild the frontend and data layer entirely in Java/Kotlin. This yields the best performance but requires rewriting the entire business logic.

For detailed instructions on building an APK with Buildozer, refer to the buildozer.md file in the project root.

---

🛡️ Security Considerations

· Passwords are hashed using SHA‑256. For production, it is recommended to upgrade to werkzeug.security (generate_password_hash / check_password_hash).
· Sessions are protected by a fixed SECRET_KEY (change this key for your deployment).
· All API endpoints are guarded with the login_required decorator.
· Referential integrity is enforced both at the database level (foreign keys) and in the API layer (preventing orphan records).
· debug mode is off in the default configuration; never run debug=True in production.

---

🤝 Contributing

This project is open source. You are welcome to open issues and submit pull requests. Please maintain the existing project structure and do not break existing features.

---

📜 License

MIT License – you are free to use, modify, and distribute this software.

---

✉️ Contact

For questions or support, feel free to open an issue on the GitHub repository.

---

Built with ❤️ and Python.

```
