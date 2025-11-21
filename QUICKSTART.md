# 🚀 SipStop - Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd sipstop
npm install
```

### 2️⃣ Start the Development Server
```bash
npm start
```

### 3️⃣ Open in Browser
Navigate to: **http://localhost:4200**

---

## 🔑 Demo Login Credentials

### Option 1: Store Owner Login
```
Email: owner@sipstop.com
Password: owner123
```
**Access**: Admin dashboard with full CRUD operations

### Option 2: Customer Login
```
Email: customer@sipstop.com
Password: customer123
```
**Access**: Browse products, add to cart, checkout

---

## 📝 Quick Feature Test

### Testing as Store Owner (Admin)
1. Login with owner credentials
2. ✨ **Add** a new product using the "+ Add New Product" button
3. 📝 **Edit** any product by clicking the "Edit" button
4. 🗑️ **Delete** a product by clicking the "Delete" button
5. 🔍 **Search** for products using the search box

### Testing as Customer
1. Login with customer credentials
2. 🛒 Browse the product catalog
3. 🔍 Filter by category or search for products
4. ➕ Add products to cart
5. 🛍️ View cart and update quantities
6. 💳 Proceed to checkout and complete the order

### Testing User Registration
1. Click "Sign up here" on the login page
2. Fill in the registration form
3. Choose role: Customer or Store Owner
4. Submit to create a new account
5. Login with your new credentials

---

## 📁 Data Files Location

All data is stored in JSON files:
- **Users**: `src/assets/users.json`
- **Products**: `src/assets/products.json`
- **Cart**: `src/assets/cart.json` (also in browser localStorage)
- **Orders**: `src/assets/orders.json`

---

## 🛠️ Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint the code
npm run lint
```

---

## 🌐 Application Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Public |
| `/signup` | Registration page | Public |
| `/admin-dashboard` | Admin CRUD panel | Owner only |
| `/customer-products` | Product catalog | Customer only |
| `/cart` | Shopping cart | Customer only |
| `/checkout` | Checkout process | Customer only |

---

## 💡 Tips

1. **Cart Persistence**: Cart items are saved in browser localStorage
2. **Session**: Your login session persists until you logout
3. **Responsive**: Try the app on different screen sizes
4. **Search**: Works on product name and description
5. **Stock**: Low stock items (<20) show orange badge

---

## ❓ Troubleshooting

### Port Already in Use
If port 4200 is already in use:
```bash
# Kill the process using port 4200
lsof -ti:4200 | xargs kill -9

# Or start on a different port
ng serve --port 4201
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser Cache Issues
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Or clear browser cache and reload

---

## 📞 Need Help?

Check the main [README.md](./README.md) for detailed documentation.

---

**Happy Testing! 🍷✨**





