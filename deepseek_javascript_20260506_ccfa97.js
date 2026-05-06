const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('client/dist'));
app.use('/public', express.static('public'));

const upload = multer({ dest: 'uploads/' });

// ========== PRODUCT ENDPOINTS ==========
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const search = req.query.search || '';
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : 1000;
  const sortBy = req.query.sortBy || 'created_at';
  const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

  let query = `SELECT * FROM products WHERE price BETWEEN ? AND ?`;
  let countQuery = `SELECT COUNT(*) as total FROM products WHERE price BETWEEN ? AND ?`;
  const params = [minPrice, maxPrice];

  if (category && category !== 'all') {
    query += ` AND category = ?`;
    countQuery += ` AND category = ?`;
    params.push(category);
  }
  
  if (search) {
    query += ` AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)`;
    countQuery += ` AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  const totalRow = db.prepare(countQuery).get(...params);
  const total = totalRow.total;
  
  const products = db.prepare(query).all(...params, limit, offset);
  res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ error: 'Product not found' });
});

// ========== ORDER ENDPOINTS ==========
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, address, city, country, zip, items, subtotal, shipping, total } = req.body;
  const orderId = 'LX' + Date.now() + Math.floor(Math.random() * 1000);
  const stmt = db.prepare(`INSERT INTO orders (id, customer_name, customer_email, address, city, country, zip, items, subtotal, shipping, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(orderId, customer_name, customer_email, address, city, country, zip, JSON.stringify(items), subtotal, shipping, total);
  res.json({ orderId, total, items });
});

app.get('/api/orders/:orderId', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  if (order) res.json(order);
  else res.status(404).json({ error: 'Order not found' });
});

// ========== ADMIN CSV UPLOAD ==========
app.post('/api/admin/upload-csv', upload.single('csv'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const insertStmt = db.prepare(`INSERT INTO products (title, description, price, compare_at_price, image_url, category, tags, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      db.exec('DELETE FROM products');
      
      for (const row of results) {
        try {
          insertStmt.run(
            row['Product Title'] || row['title'] || 'No Title',
            row['Description'] || row['description'] || '',
            parseFloat(row['Price'] || row['price'] || 0),
            parseFloat(row['Compare At Price'] || row['compare_at_price'] || 0),
            row['Image URL'] || row['image_url'] || 'https://images.unsplash.com/photo-1596462502278-27e2b6bd038c?w=400',
            row['Category'] || row['category'] || 'Uncategorized',
            row['Tags'] || row['tags'] || '',
            parseInt(row['Stock'] || row['stock'] || 100)
          );
        } catch (err) { console.error('Insert error:', err); }
      }
      fs.unlinkSync(req.file.path);
      res.json({ success: true, count: results.length });
    });
});

app.get('/api/admin/template', (req, res) => {
  res.download(path.join(__dirname, 'public', 'admin-template.csv'));
});

app.post('/api/admin/reset-demo', (req, res) => {
  require('./seedProducts.js');
  res.json({ success: true });
});

// ========== SITEMAP & SEO ==========
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Catch-all for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Luxe Noir running on http://localhost:${PORT}`));