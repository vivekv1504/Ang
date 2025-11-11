const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { sendWelcomeEmail, sendOrderConfirmationEmail } = require('./email-service');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File paths
const USERS_FILE = path.join(__dirname, 'src/assets/users.json');
const PRODUCTS_FILE = path.join(__dirname, 'src/assets/products.json');
const ORDERS_FILE = path.join(__dirname, 'src/assets/orders.json');

// Helper functions
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    // Write to a temporary file first
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Verify the temp file was written correctly
    const tempData = fs.readFileSync(tempPath, 'utf8');
    const parsedData = JSON.parse(tempData);
    
    if (parsedData && Array.isArray(parsedData)) {
      // If valid, rename temp file to actual file (atomic operation)
      fs.renameSync(tempPath, filePath);
      console.log(`✅ Data written to ${filePath} (${parsedData.length} records)`);
      return true;
    } else {
      console.error(`❌ Data validation failed for ${filePath}`);
      fs.unlinkSync(tempPath); // Delete invalid temp file
      return false;
    }
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error);
    // Clean up temp file if it exists
    const tempPath = `${filePath}.tmp`;
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
    }
    return false;
  }
};

// ============ USERS ROUTES ============

// Get all users
app.get('/api/users', (req, res) => {
  const users = readJsonFile(USERS_FILE);
  res.json(users);
});

// Add new user (Signup)
app.post('/api/users', async (req, res) => {
  const users = readJsonFile(USERS_FILE);
  const newUser = req.body;
  
  // Check if email exists
  if (users.some(u => u.email === newUser.email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  // Generate ID
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
  newUser.id = newId;
  
  users.push(newUser);
  
  if (writeJsonFile(USERS_FILE, users)) {
    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(newUser.email, newUser.name || newUser.email.split('@')[0])
      .then(() => console.log(`📧 Welcome email sent to ${newUser.email}`))
      .catch(err => console.error(`❌ Failed to send welcome email to ${newUser.email}:`, err));
    
    res.status(201).json({ success: true, user: newUser });
  } else {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Update user profile
app.put('/api/users/:id', (req, res) => {
  const users = readJsonFile(USERS_FILE);
  const userId = parseInt(req.params.id);
  const updatedData = req.body;
  
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    // Don't allow changing the role or id
    delete updatedData.role;
    delete updatedData.id;
    
    users[index] = { ...users[index], ...updatedData };
    
    if (writeJsonFile(USERS_FILE, users)) {
      console.log('✅ User profile updated:', users[index]);
      res.json({ success: true, user: users[index] });
    } else {
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// ============ PRODUCTS ROUTES ============

// Get all products
app.get('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  res.json(products);
});

// Add new product
app.post('/api/products', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const newProduct = req.body;
  
  // Generate ID
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  newProduct.id = newId;
  
  products.push(newProduct);
  
  if (writeJsonFile(PRODUCTS_FILE, products)) {
    console.log('✅ Product added:', newProduct);
    res.status(201).json({ success: true, product: newProduct });
  } else {
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;
  
  const index = products.findIndex(p => p.id === productId);
  
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct, id: productId };
    
    if (writeJsonFile(PRODUCTS_FILE, products)) {
      console.log('✅ Product updated:', products[index]);
      res.json({ success: true, product: products[index] });
    } else {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE);
  const productId = parseInt(req.params.id);
  
  const filteredProducts = products.filter(p => p.id !== productId);
  
  if (filteredProducts.length < products.length) {
    if (writeJsonFile(PRODUCTS_FILE, filteredProducts)) {
      console.log('✅ Product deleted:', productId);
      res.json({ success: true, message: 'Product deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// ============ ORDERS ROUTES ============

// Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readJsonFile(ORDERS_FILE);
  res.json(orders);
});

// Add new order
app.post('/api/orders', async (req, res) => {
  console.log('📦 Received order request:', req.body);
  
  const orders = readJsonFile(ORDERS_FILE);
  const newOrder = req.body;
  
  // Validate order data
  if (!newOrder || !newOrder.userId) {
    console.error('❌ Invalid order data');
    return res.status(400).json({ error: 'Invalid order data' });
  }
  
  // Generate ID
  const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id || 0)) + 1 : 1;
  newOrder.id = newId;
  
  // Add timestamp if not present
  if (!newOrder.date) {
    newOrder.date = new Date().toISOString();
  }
  
  orders.push(newOrder);
  
  const writeSuccess = writeJsonFile(ORDERS_FILE, orders);
  
  if (writeSuccess) {
    console.log('✅ Order saved successfully to JSON file');
    console.log(`✅ Order ID: ${newOrder.id}, Order Number: ${newOrder.orderNumber}`);
    console.log(`📊 Total orders in database: ${orders.length}`);
    
    // Verify the order was actually written by reading it back
    const verifyOrders = readJsonFile(ORDERS_FILE);
    const savedOrder = verifyOrders.find(o => o.id === newOrder.id);
    
    if (savedOrder) {
      console.log('✅ Order verified in JSON file');
      
      // Send order confirmation email
      const users = readJsonFile(USERS_FILE);
      const user = users.find(u => u.id === newOrder.userId);
      
      if (user && user.email) {
        // Map shippingInfo to shippingAddress for email template
        const shippingAddress = newOrder.shippingInfo ? {
          street: newOrder.shippingInfo.address || 'N/A',
          city: newOrder.shippingInfo.city || 'N/A',
          state: newOrder.shippingInfo.state || '',
          zipCode: newOrder.shippingInfo.zipCode || '',
          country: newOrder.shippingInfo.country || 'N/A'
        } : null;

        const orderDetails = {
          orderNumber: newOrder.orderNumber,
          items: newOrder.items,
          total: newOrder.total,
          shippingAddress: shippingAddress,
          paymentMethod: newOrder.paymentInfo?.cardName ? `Card ending in ${newOrder.paymentInfo.cardNumber}` : 'N/A'
        };
        
        sendOrderConfirmationEmail(user.email, user.name || user.email.split('@')[0], orderDetails)
          .then(() => console.log(`📧 Order confirmation email sent to ${user.email}`))
          .catch(err => console.error(`❌ Failed to send order confirmation email:`, err));
      }
      
      res.status(201).json({ success: true, order: newOrder });
    } else {
      console.error('❌ Order not found in file after write');
      res.status(500).json({ error: 'Failed to verify order save' });
    }
  } else {
    console.error('❌ Failed to write order to file');
    res.status(500).json({ error: 'Failed to save order to file' });
  }
});

// Test endpoint to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// ============ SERVER START ============

app.listen(PORT, HOST, () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }
  
  console.log('🚀 ========================================');
  console.log('🚀 SipStop Backend Server is running!');
  console.log('🚀 ========================================');
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌍 Network: http://${localIP}:${PORT}`);
  console.log('🚀 ========================================');
  console.log('📡 API Endpoints:');
  console.log(`   📝 Users: http://${localIP}:${PORT}/api/users`);
  console.log(`   🍷 Products: http://${localIP}:${PORT}/api/products`);
  console.log(`   📦 Orders: http://${localIP}:${PORT}/api/orders`);
  console.log(`   🏥 Health: http://${localIP}:${PORT}/api/health`);
  console.log('🚀 ========================================');
  console.log('✅ Server is ready to accept requests!');
  console.log('💾 All changes will be saved to JSON files');
  console.log(`📱 Access from other devices: http://${localIP}:${PORT}`);
  console.log('🚀 ========================================');
  
  // Log current data counts
  const users = readJsonFile(USERS_FILE);
  const products = readJsonFile(PRODUCTS_FILE);
  const orders = readJsonFile(ORDERS_FILE);
  console.log(`📊 Current Database Status:`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Orders: ${orders.length}`);
  console.log('🚀 ========================================\n');
});


