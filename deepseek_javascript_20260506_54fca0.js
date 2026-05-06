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

// API endpoints (same as previous, but includes sitemap/robots)
app.get('/api/products', (req, res) => { /* same as before */ });
app.get('/api/products/:id', (req, res) => { /* same */ });
app.post('/api/orders', (req, res) => { /* same */ });
app.get('/api/orders/:orderId', (req, res) => { /* same */ });
app.post('/api/admin/upload-csv', upload.single('csv'), (req, res) => { /* same */ });
app.get('/api/admin/template', (req, res) => { res.download(path.join(__dirname, 'public', 'admin-template.csv')); });
app.post('/api/admin/reset-demo', (req, res) => { require('./seedProducts.js'); res.json({ success: true }); });

// Sitemap & robots
app.get('/sitemap.xml', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'sitemap.xml')); });
app.get('/robots.txt', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'robots.txt')); });

// Catch-all for React Router (important for Cloudflare, but we also have _redirects)
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'client/dist', 'index.html')); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Luxe Noir running on port ${PORT}`));