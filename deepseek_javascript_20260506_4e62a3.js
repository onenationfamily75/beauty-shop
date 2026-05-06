const db = require('./database.js');

const categories = ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Bath & Body', 'Tools & Brushes', 'Natural & Organic', 'Menopause Care'];
const beautyImagePool = [
  'https://images.unsplash.com/photo-1596462502278-27e2b6bd038c?w=400',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
  'https://images.unsplash.com/photo-1618084842390-3eac6d1bcf3c?w=400',
  'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400',
  'https://images.unsplash.com/photo-1618938243995-4b8f1ef70631?w=400',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
];
const adjectives = ['Luxury', 'Silk', 'Pure', 'Radiant', 'Velvet', 'Divine', 'Enchanted', 'Golden', 'Crystal', 'Midnight'];
const nouns = ['Lipstick', 'Serum', 'Cream', 'Mascara', 'Foundation', 'Perfume', 'Mask', 'Oil', 'Setting Spray', 'Palette'];

function getRandomImage() {
  return beautyImagePool[Math.floor(Math.random() * beautyImagePool.length)];
}

function generateProducts(count = 40040) {
  const stmt = db.prepare(`INSERT INTO products (title, description, price, compare_at_price, image_url, category, tags, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  db.exec('DELETE FROM products');
  console.log(`Seeding ${count} products...`);
  
  for (let i = 1; i <= count; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const title = `${adj} ${noun} ${Math.floor(i / 1000)}`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = (Math.floor(Math.random() * 80) + 15).toFixed(2);
    const comparePrice = (parseFloat(price) + Math.floor(Math.random() * 30)).toFixed(2);
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    const description = `Experience the ${adj.toLowerCase()} touch with our ${noun.toLowerCase()}. Perfect for ${category.toLowerCase()} routine. Cruelty-free.`;
    const tags = `${category},beauty,${noun.toLowerCase()}`;
    stmt.run(title, description, price, comparePrice, getRandomImage(), category, tags, rating);
    if (i % 5000 === 0) console.log(`Seeded ${i} products...`);
  }
  console.log('Seeding complete!');
}

generateProducts(40040);