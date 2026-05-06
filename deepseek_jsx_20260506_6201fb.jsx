import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Star, Phone, Truck, Shield, CreditCard } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });
const CartContext = React.createContext();

// SEO Helper
function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title || "Luxé Noir - Affordable Luxury Beauty";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) metaDesc.setAttribute('content', description);
  }, [title, description]);
}

function App() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const saved = localStorage.getItem('luxeCart');
    if (saved) setCart(JSON.parse(saved));
  }, []);
  const addToCart = (product, qty = 1) => {
    const existing = cart.find(i => i.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
    } else {
      newCart = [...cart, { ...product, quantity: qty }];
    }
    setCart(newCart);
    localStorage.setItem('luxeCart', JSON.stringify(newCart));
    toast.success(`${product.title} added`);
  };
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      const newCart = cart.filter(i => i.id !== id);
      setCart(newCart);
      localStorage.setItem('luxeCart', JSON.stringify(newCart));
    } else {
      const newCart = cart.map(i => i.id === id ? { ...i, quantity: qty } : i);
      setCart(newCart);
      localStorage.setItem('luxeCart', JSON.stringify(newCart));
    }
  };
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('luxeCart');
  };
  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart }}>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white font-sans">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/:orderId" element={<PrivatePayment />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/about" element={<PolicyPage title="About Us" content="Luxé Noir brings affordable luxury beauty to women across America, Europe, Asia, and Africa. Curated from top global brands with direct dropshipping." />} />
            <Route path="/shipping" element={<PolicyPage title="Shipping Policy" content="Free worldwide shipping on orders over $75. Delivery within 5-12 business days. Track your order via email." />} />
            <Route path="/returns" element={<PolicyPage title="Returns & Refunds" content="30-day satisfaction guarantee. Return unused items for full refund. Contact support@luxenoir.com." />} />
            <Route path="/privacy" element={<PolicyPage title="Privacy Policy" content="We protect your data. No third-party sharing. Secure SSL encryption." />} />
            <Route path="/terms" element={<PolicyPage title="Terms of Service" content="By using Luxé Noir you agree to our terms. All products are for personal use." />} />
            <Route path="/faq" element={<PolicyPage title="FAQ" content="Q: How to track order? A: Email with tracking link. Q: Customs fees? A: Buyer responsible." />} />
            <Route path="/contact" element={<PolicyPage title="Contact" content="Email: hello@luxenoir.com | WhatsApp: +254 786 781 665 | 24/7 Support" />} />
          </Routes>
          <Footer />
        </div>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff' } }} />
      </BrowserRouter>
    </CartContext.Provider>
  );
}

// Header, Home, Shop, ProductCard, Cart, Checkout, PrivatePayment, Admin, Testimonials, PolicyPage, Footer
// (These components are identical to the previous answer – I'll keep them compact but functional)

function Header() {
  const { cart } = React.useContext(CartContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const handleSearch = (e) => {
    e.preventDefault();
    if (search) navigate(`/shop?search=${search}`);
    setMobileOpen(false);
  };
  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gold-500/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold"><span className="text-gold-400">LUXÉ</span> NOIR</Link>
        <nav className="hidden md:flex space-x-8">
          <Link to="/shop" className="hover:text-gold-400">Shop</Link>
          <Link to="/testimonials" className="hover:text-gold-400">Reviews</Link>
          <Link to="/about" className="hover:text-gold-400">About</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="hidden md:flex">
            <input type="text" placeholder="Search 40k+ products..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-gray-900 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400" />
            <button type="submit"><Search size={20} className="ml-2"/></button>
          </form>
          <Link to="/cart" className="relative"><ShoppingBag size={22}/>{cart.length>0 && <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}</Link>
          <button onClick={()=>setMobileOpen(true)} className="md:hidden"><Menu size={24}/></button>
        </div>
      </div>
      {mobileOpen && <div className="fixed inset-0 bg-black z-50 p-4"><button onClick={()=>setMobileOpen(false)} className="float-right"><X size={28}/></button><div className="clear-both mt-12 space-y-4"><form onSubmit={handleSearch} className="flex"><input className="flex-1 bg-gray-900 p-2 rounded" value={search} onChange={e=>setSearch(e.target.value)}/><button type="submit"><Search className="ml-2"/></button></form><Link to="/shop" onClick={()=>setMobileOpen(false)} className="block py-2">Shop</Link><Link to="/testimonials" onClick={()=>setMobileOpen(false)}>Reviews</Link><Link to="/about">About</Link></div></div>}
    </header>
  );
}

function Home() {
  usePageMeta("Luxé Noir - Affordable Luxury Beauty Worldwide", "Shop 40,000+ beauty products. Free shipping over $75. Global delivery to USA, Europe, Asia, Africa.");
  const [products, setProducts] = useState([]);
  useEffect(() => { API.get('/products?page=1&limit=8').then(res => setProducts(res.data.products)); }, []);
  return (
    <main>
      <section className="relative h-[70vh] bg-gradient-to-r from-gold-900/40 to-black"><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600')] bg-cover opacity-20"></div><div className="relative container mx-auto px-4 h-full flex items-center"><div><h1 className="text-5xl md:text-7xl font-bold mb-4">Affordable Luxury <span className="text-gold-400">Worldwide</span></h1><p className="text-xl mb-8">From NYC to Nairobi, Paris to Shanghai — premium beauty at prices you love</p><Link to="/shop" className="bg-gold-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-gold-400">Shop Now →</Link></div></div></section>
      <section className="py-16 container mx-auto px-4"><h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['Skincare','Makeup','Haircare','Fragrance'].map(cat => <Link key={cat} to={`/shop?category=${cat.toLowerCase()}`} className="relative h-64 rounded-lg overflow-hidden group"><img src={`https://images.unsplash.com/photo-${cat==='Skincare'?'1556228578-0d85b1a4d571':cat==='Makeup'?'1596462502278-27e2b6bd038c':cat==='Haircare'?'1618938243995-4b8f1ef70631':'1594040226829-7f251ab46d80'}?w=400`} className="w-full h-full object-cover group-hover:scale-105 transition"/><div className="absolute inset-0 bg-black/40 flex items-center justify-center"><h3 className="text-white text-2xl font-bold">{cat}</h3></div></Link>)}</div></section>
      <section className="py-16 bg-gray-900"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold mb-8">Bestsellers</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">{products.slice(0,4).map(p => <ProductCard key={p.id} product={p}/>)}</div></div></section>
    </main>
  );
}

function ProductCard({ product }) {
  const { addToCart } = React.useContext(CartContext);
  return (<div className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-xl transition"><Link to={`/product/${product.id}`}><img src={product.image_url} className="w-full h-64 object-cover"/><div className="p-4"><h3 className="font-semibold truncate">{product.title}</h3><div className="flex items-center mt-2"><span className="text-gold-400">${product.price}</span>{product.compare_at_price && <span className="text-gray-500 line-through ml-2 text-sm">${product.compare_at_price}</span>}</div><div className="flex mt-2"><Star size={16} className="fill-gold-400 text-gold-400"/><span className="text-sm ml-1">{product.rating}</span></div></div></Link><button onClick={() => addToCart(product)} className="w-full bg-gold-500 text-black py-2 mt-2 hover:bg-gold-400">Add to Cart</button></div>);
}

function Shop() { usePageMeta("Shop 40,000+ Beauty Products | Luxé Noir", "Browse our full collection of affordable makeup, skincare, haircut, fragrance. Filter by price and category."); /* same as earlier but shortened for brevity – works fully */ const [products, setProducts] = useState([]); const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1); const [filters, setFilters] = useState({ category: 'all', sortBy: 'created_at', minPrice: 0, maxPrice: 200 }); const [search, setSearch] = useState(''); useEffect(() => { const params = new URLSearchParams(window.location.search); const cat = params.get('category') || 'all'; setFilters(prev => ({...prev, category: cat})); fetchProducts(1, cat); }, []); const fetchProducts = async (pageNum, categoryOverride) => { const params = { page: pageNum, limit: 24, category: categoryOverride || filters.category, sortBy: filters.sortBy, minPrice: filters.minPrice, maxPrice: filters.maxPrice, search }; const res = await API.get('/products', { params }); setProducts(res.data.products); setTotalPages(res.data.totalPages); }; useEffect(() => { fetchProducts(page); }, [page, filters, search]); return (<div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8"><aside className="md:w-1/4"><h3 className="font-bold mb-4">Categories</h3>{['all','Skincare','Makeup','Haircare','Fragrance'].map(cat => <button key={cat} onClick={() => {setFilters({...filters, category: cat.toLowerCase()}); fetchProducts(1, cat.toLowerCase());}} className="block w-full text-left py-2 hover:text-gold-400">{cat}</button>)}<h3 className="font-bold mt-6 mb-4">Price</h3><div className="flex gap-2"><input type="number" placeholder="Min" className="bg-gray-800 p-2 w-full" onChange={e=>setFilters({...filters, minPrice: e.target.value})}/><input type="number" placeholder="Max" className="bg-gray-800 p-2 w-full" onChange={e=>setFilters({...filters, maxPrice: e.target.value})}/></div><button onClick={()=>fetchProducts(1)} className="mt-4 bg-gold-500 text-black px-4 py-2 rounded">Apply</button></aside><div className="md:w-3/4"><div className="flex justify-between mb-6"><input type="text" placeholder="Search products..." className="bg-gray-800 p-2 rounded flex-1" onChange={e=>setSearch(e.target.value)}/><select onChange={e=>setFilters({...filters, sortBy: e.target.value})} className="bg-gray-800 ml-4 p-2 rounded"><option value="created_at">Latest</option><option value="price">Price: Low to High</option><option value="rating">Rating</option></select></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{products.map(p => <ProductCard key={p.id} product={p}/>)}</div><div className="flex justify-center mt-8 gap-2">{Array.from({ length: Math.min(5, totalPages) }, (_,i) => <button key={i+1} onClick={()=>setPage(i+1)} className={`px-4 py-2 rounded ${page === i+1 ? 'bg-gold-500 text-black' : 'bg-gray-800'}`}>{i+1}</button>)}</div></div></div>); }

function ProductDetail() { const { id } = useParams(); const [product, setProduct] = useState(null); const { addToCart } = React.useContext(CartContext); useEffect(() => { API.get(`/products/${id}`).then(res => setProduct(res.data)); }, [id]); usePageMeta(product?.title, product?.description); if (!product) return <div className="text-center py-20">Loading...</div>; return (<div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12"><img src={product.image_url} className="md:w-1/2 rounded-lg"/><div><h1 className="text-3xl font-bold mb-4">{product.title}</h1><p className="text-gold-400 text-2xl mb-4">${product.price}</p><p className="text-gray-300 mb-6">{product.description}</p><button onClick={() => addToCart(product)} className="bg-gold-500 text-black px-8 py-3 rounded-full font-semibold">Add to Cart →</button></div></div>); }

function Cart() { const { cart, updateQuantity, clearCart } = React.useContext(CartContext); const subtotal = cart.reduce((s,i)=>s + i.price * i.quantity,0); const shipping = subtotal > 75 ? 0 : 10; const total = subtotal + shipping; return (<div className="container mx-auto px-4 py-12"><h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>{cart.length === 0 ? <p>Your cart is empty</p> : <div className="flex flex-col lg:flex-row gap-8"><div className="flex-1">{cart.map(item => (<div key={item.id} className="flex gap-4 border-b border-gray-800 py-4"><img src={item.image_url} className="w-20 h-20 object-cover"/><div className="flex-1"><h3>{item.title}</h3><p>${item.price}</p><div className="flex items-center mt-2"><button onClick={()=>updateQuantity(item.id, item.quantity-1)} className="bg-gray-800 px-3 py-1">-</button><span className="mx-4">{item.quantity}</span><button onClick={()=>updateQuantity(item.id, item.quantity+1)} className="bg-gray-800 px-3 py-1">+</button></div></div></div>))}</div><div className="lg:w-80 bg-gray-900 p-6 rounded-lg h-fit"><h3 className="text-xl mb-4">Order Summary</h3><div className="space-y-2"><p>Subtotal: ${subtotal.toFixed(2)}</p><p>Shipping: {shipping === 0 ? 'Free' : `$${shipping}`}</p><p className="text-xl font-bold">Total: ${total.toFixed(2)}</p></div><Link to="/checkout" className="block bg-gold-500 text-black text-center py-3 rounded-full mt-6">Proceed to Checkout</Link></div></div>}</div>); }

function Checkout() { const { cart, clearCart } = React.useContext(CartContext); const navigate = useNavigate(); const [form, setForm] = useState({ name: '', email: '', address: '', city: '', country: 'US', zip: '' }); const subtotal = cart.reduce((s,i)=>s + i.price*i.quantity,0); const shipping = subtotal > 75 ? 0 : 10; const total = subtotal + shipping; const handleSubmit = async (e) => { e.preventDefault(); const order = { customer_name: form.name, customer_email: form.email, address: form.address, city: form.city, country: form.country, zip: form.zip, items: cart, subtotal, shipping, total }; const res = await API.post('/orders', order); clearCart(); navigate(`/payment/${res.data.orderId}`); }; return (<div className="container mx-auto px-4 py-12 max-w-2xl"><h1 className="text-3xl font-bold mb-8">Checkout</h1><form onSubmit={handleSubmit} className="space-y-4"><input required placeholder="Full Name" className="w-full bg-gray-800 p-3 rounded" onChange={e=>setForm({...form,name:e.target.value})}/><input required type="email" placeholder="Email" className="w-full bg-gray-800 p-3 rounded" onChange={e=>setForm({...form,email:e.target.value})}/><input required placeholder="Address" className="w-full bg-gray-800 p-3 rounded" onChange={e=>setForm({...form,address:e.target.value})}/><input required placeholder="City" className="w-full bg-gray-800 p-3 rounded" onChange={e=>setForm({...form,city:e.target.value})}/><select required className="w-full bg-gray-800 p-3 rounded" onChange={e=>setForm({...form,country:e.target.value})}><option>US</option><option>GB</option><option>KE</option><option>IN</option><option>FR</option><option>DE</option><option>AE</option></select><input required placeholder="ZIP" className="w-full bg-gray-800 p-3 rounded" onChange={e=>setForm({...form,zip:e.target.value})}/><div className="border-t border-gray-800 pt-4"><p>Total: ${total.toFixed(2)}</p></div><button type="submit" className="w-full bg-gold-500 text-black py-3 rounded-full font-semibold">Place Order</button></form></div>); }

function PrivatePayment() { const { orderId } = useParams(); const [order, setOrder] = useState(null); const [copied, setCopied] = useState(null); useEffect(() => { API.get(`/orders/${orderId}`).then(res => setOrder(res.data)).catch(()=>{}); }, [orderId]); const copyText = (text, field) => { navigator.clipboard.writeText(text); setCopied(field); setTimeout(()=>setCopied(null),2000); }; const whatsappMessage = `Order%20%23${order?.id}%0ATotal%3A%20%24${order?.total}%0AProducts%3A%20${JSON.parse(order?.items || '[]').map(i=>i.title).join(', ')}%0APayment%20Method%3A%20Bank%20Transfer`; if (!order) return <div className="text-center py-20">Loading order...</div>; return (<div className="container mx-auto px-4 py-12 max-w-2xl"><div className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-8"><h1 className="text-3xl font-bold mb-2">💳 Complete Your Payment</h1><p className="mb-6">Order #{order.id} • Total: ${order.total}</p><div className="space-y-6"><div className="bg-black/50 p-4 rounded-lg"><h3 className="font-bold text-gold-400">🌍 International Bank Transfer</h3><div className="mt-2 space-y-2"><div className="flex justify-between items-center"><span>IBAN:</span><code className="bg-gray-800 px-2 py-1 rounded">MT08CFE28004000000000006122167</code><button onClick={()=>copyText('MT08CFE28004000000000006122167','iban')} className="text-gold-400 text-sm">{copied==='iban'?'Copied!':'Copy'}</button></div><div>SWIFT: CFTEMTM1XXX</div><div>Bank: OpenPayd (Daniel Wanjau Mwangi)</div></div></div><div className="bg-black/50 p-4 rounded-lg"><h3 className="font-bold text-gold-400">🇺🇸 US Bank (ACH)</h3><div>Account: 061815030101</div><div>Routing: 043087080</div><div>Bank: SSB Bank</div><button onClick={()=>copyText('061815030101','usAccount')} className="text-gold-400 text-sm mt-2">{copied==='usAccount'?'Copied!':'Copy Account'}</button></div><a href={`https://wa.me/254786781665?text=${whatsappMessage}`} target="_blank" className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-green-700"><Phone size={20}/> Confirm via WhatsApp</a><p className="text-gray-400 text-sm text-center">After bank transfer, click WhatsApp to confirm your order. Our team will verify within 2 hours.</p></div></div></div>); }

function Admin() { const [file, setFile] = useState(null); const handleUpload = async () => { const fd = new FormData(); fd.append('csv', file); await API.post('/admin/upload-csv', fd); toast.success('Products updated!'); }; const resetDemo = async () => { await API.post('/admin/reset-demo'); toast.success('40k demo products restored'); }; return (<div className="container mx-auto px-4 py-12 max-w-2xl"><h1 className="text-3xl font-bold mb-6">Admin Panel</h1><div className="bg-gray-900 p-6 rounded-lg space-y-6"><div><h3 className="text-xl mb-2">CSV Bulk Upload</h3><input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} className="mb-4"/><button onClick={handleUpload} className="bg-gold-500 text-black px-6 py-2 rounded">Upload & Replace Catalog</button><a href="/api/admin/template" download className="ml-4 underline">Download CSV Template</a></div><div><button onClick={resetDemo} className="bg-red-600 px-6 py-2 rounded">Reset to 40k Demo Products</button></div><p className="text-sm text-gray-400">Compatible with CJ Dropshipping, Spocket, AliExpress exports.</p></div></div>); }

function Testimonials() { usePageMeta("Customer Reviews | Luxé Noir", "See what women in USA, Europe, Asia, and Africa say about our affordable beauty products."); const reviews = [{ name:"Emma L.", country:"USA", text:"Absolutely love the quality! Shipping was fast to New York.", continent:"America"},{ name:"Amara O.", country:"Nigeria", text:"Finally affordable luxury that ships to Lagos. The foundation is perfect!", continent:"Africa"},{ name:"Priya K.", country:"India", text:"Huge variety and great prices. My go-to for skincare.", continent:"Asia"},{ name:"Sophie M.", country:"France", text:"Exquisite fragrance collection. Fast delivery to Paris.", continent:"Europe"}]; return (<div className="container mx-auto px-4 py-12"><h1 className="text-4xl font-bold text-center mb-12">What Women Worldwide Say</h1><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{reviews.map(r=><div key={r.name} className="bg-gray-900 p-6 rounded-lg"><Star className="fill-gold-400 text-gold-400 mb-2"/><p className="italic">"{r.text}"</p><p className="mt-4 font-bold">{r.name}</p><p className="text-gold-400 text-sm">{r.country} • {r.continent}</p></div>)}</div></div>); }

function PolicyPage({ title, content }) { usePageMeta(title, content.substring(0,160)); return (<div className="container mx-auto px-4 py-12 max-w-3xl"><h1 className="text-3xl font-bold mb-6">{title}</h1><div className="prose prose-invert"><p>{content}</p></div></div>); }

function Footer() { return (<footer className="bg-black border-t border-gold-500/20 mt-20 py-12"><div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8"><div><h3 className="font-bold text-gold-400 mb-4">LUXÉ NOIR</h3><p>Affordable beauty delivered worldwide</p></div><div><h4>Shop</h4><Link to="/shop" className="block text-gray-400">All Products</Link><Link to="/testimonials" className="block text-gray-400">Reviews</Link></div><div><h4>Support</h4><Link to="/shipping">Shipping</Link><Link to="/returns">Returns</Link><Link to="/faq">FAQ</Link><Link to="/contact">Contact</Link></div><div><h4>Legal</h4><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div></div><div className="text-center text-gray-500 mt-8">© 2025 Luxé Noir — Global Women's Beauty</div></footer>); }

export default App;