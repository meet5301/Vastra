# VASTRA - MERN Stack Fashion Store

Full-stack e-commerce application built with MongoDB, Express, Node.js.
Original HTML/CSS/design preserved — only backend and functionality added.

---

## 📁 Project Structure

```
Vastra-MERN/
├── backend/                    ← Main server (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── models/
│   │   ├── User.js             ← User schema (auth, wishlist, addresses)
│   │   ├── Product.js          ← Product schema (reviews, variants)
│   │   └── Order.js            ← Order schema (items, shipping, status)
│   ├── routes/
│   │   ├── auth.js             ← Login, signup, profile, wishlist
│   │   ├── products.js         ← Products CRUD + reviews
│   │   ├── orders.js           ← Place & track orders
│   │   └── admin.js            ← Admin user management
│   ├── middleware/
│   │   └── auth.js             ← JWT protect + adminOnly middleware
│   ├── public/
│   │   ├── css/                ← Original CSS (unchanged)
│   │   ├── images/             ← Product images
│   │   └── js/
│   │       ├── navbar.js       ← Original navbar
│   │       ├── auth.js         ← Login/signup API calls
│   │       ├── shop.js         ← Load products from DB, cart, filters
│   │       ├── shopingbag.js   ← Cart page rendering
│   │       ├── checkout.js     ← Place order to DB
│   │       └── profile.js      ← User profile & orders
│   ├── templates/              ← Original HTML pages (unchanged design)
│   ├── .env                    ← Environment variables
│   ├── package.json
│   ├── seed.js                 ← Database seeder
│   └── server.js               ← Main Express server
│
└── frontend-admin/             ← Admin Panel
    ├── public/
    │   └── css/
    │       └── admin.css       ← Admin panel styles
    └── templates/
        ├── admin-login.html    ← Admin login page
        ├── dashboard.html      ← Stats & recent orders
        ├── admin-products.html ← Product CRUD
        ├── admin-orders.html   ← Order management & status update
        └── admin-users.html    ← User management & role control
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vastra
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@vastra.com
ADMIN_PASSWORD=admin123
```

For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

### 4. Seed the database
```bash
cd backend
node seed.js
```

### 5. Add JS to your HTML templates

Add these `<script>` tags before `</body>` in the respective HTML files:

**login.html** → `<script src="/js/auth.js"></script>`
**signup.html** → `<script src="/js/auth.js"></script>`
**shop.html** → `<script src="/js/shop.js"></script>` (replace existing inline script)
**shopingbag.html** → `<script src="/js/shopingbag.js"></script>`
**checkout.html** → `<script src="/js/checkout.js"></script>`
**profile.html** → `<script src="/js/profile.js"></script>`

### 6. Create products image folder
```bash
mkdir -p backend/public/images/products
```

### 7. Start the server
```bash
cd backend
npm start
# or for development:
npm run dev
```

---

## 🌐 URLs

| Page | URL |
|------|-----|
| Home | http://localhost:5000 |
| Shop | http://localhost:5000/shop |
| Login | http://localhost:5000/login |
| Signup | http://localhost:5000/signup |
| Profile | http://localhost:5000/profile |
| Cart | http://localhost:5000/shopingbag |
| Checkout | http://localhost:5000/checkout |
| **Admin Login** | **http://localhost:5000/admin** |
| **Admin Dashboard** | **http://localhost:5000/admin/dashboard** |
| **Admin Products** | **http://localhost:5000/admin/products** |
| **Admin Orders** | **http://localhost:5000/admin/orders** |
| **Admin Users** | **http://localhost:5000/admin/users** |

---

## 🔐 Default Admin Credentials
```
Email:    admin@vastra.com
Password: admin123
```
⚠️ Change these in `.env` before deploying to production!

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get logged-in user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |
| POST | /api/auth/wishlist/:id | Toggle wishlist |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/products | All active products (filter, search, paginate) |
| GET | /api/products/featured | Featured products |
| GET | /api/products/:id | Single product |
| POST | /api/products/:id/reviews | Add review (auth) |
| GET | /api/products/admin/all | All products (admin) |
| POST | /api/products/admin/create | Add product (admin) |
| PUT | /api/products/admin/:id | Update product (admin) |
| DELETE | /api/products/admin/:id | Delete product (admin) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/orders | Place order |
| GET | /api/orders/my | My orders (auth) |
| GET | /api/orders/:id | Order detail |
| GET | /api/orders/admin/all | All orders (admin) |
| GET | /api/orders/admin/stats | Dashboard stats (admin) |
| PUT | /api/orders/admin/:id/status | Update status (admin) |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/users | All users (admin) |
| PUT | /api/admin/users/:id/role | Change user role (admin) |
| DELETE | /api/admin/users/:id | Delete user (admin) |

---

## ✅ Features

**User Side:**
- Register / Login with JWT authentication
- Browse products with search, filter by category, sort by price/rating
- Add to cart (localStorage), update quantities
- Place orders (logged-in or guest checkout)
- View order history in profile
- Wishlist (logged-in users)

**Admin Side:**
- Separate admin login
- Dashboard with total orders, revenue, pending, delivered stats
- Product management: add, edit, delete, toggle active/featured
- Image upload for products
- Order management: view details, update status (Processing → Confirmed → Shipped → Delivered)
- User management: view all users, change roles, delete users
