import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { connectDatabase, Product, Staff, Order } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { console.error('JWT_SECRET must be at least 32 characters.'); process.exit(1); }
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim()) }));
app.use(express.json({ limit: '100kb' }));
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const statuses = ['Received', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const publicProduct = p => ({ id: p.id, name: p.name, category: p.category, desc: p.description, price: Number(p.price), image: p.image_url, tag: p.tag });
const publicOrder = o => ({ id: o.order_code, customer: { name: o.customer_name, phone: o.customer_phone, email: o.customer_email || '', type: o.order_type, notes: o.notes || '' }, items: o.items.map(i => ({ id: i.product_id, name: i.product_name, qty: i.quantity, price: Number(i.unit_price) })), total: Number(o.total), status: o.status, created: o.createdAt });
const auth = (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Please sign in with a staff account.' });
  try { req.staff = jwt.verify(token, process.env.JWT_SECRET); next(); } catch { return res.status(401).json({ error: 'Your staff session has expired. Please sign in again.' }); }
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mailerConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);
async function sendOrderEmail(order, status, intro = '') {
  const to = order.customer?.email;
  if (!to) return { sent: false, reason: 'No customer email address was supplied.' };
  if (!mailerConfigured()) return { sent: false, reason: 'Email service is not configured on the server.' };
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: String(process.env.SMTP_SECURE || 'true') === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  const messages = { Received: 'We have received your order and our team will prepare it with care.', Preparing: 'Our team has started preparing your order.', Ready: 'Your order is ready. Please come to Brew Haven for collection or service.', Completed: 'Your order has been completed. Thank you for choosing Brew Haven!', Cancelled: 'Your order has been cancelled. Please contact Brew Haven if you need assistance.' };
  const items = (order.items || []).map(i => `${i.name} x ${i.qty}`).join(', ');
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject: `Brew Haven order ${order.id}: ${status}`, text: `${intro ? intro + '\n\n' : ''}Hello ${order.customer?.name || 'Customer'},\n\n${messages[status] || `Your order status is now ${status}.`}\n\nOrder: ${order.id}\nItems: ${items}\nTotal: M ${Number(order.total || 0).toFixed(2)}\nStatus: ${status}\n\nThank you,\nBrew Haven Coffee Shop` });
  return { sent: true };
}
async function makeOrder({ name, phone, email, type, notes, items, requireEmail = false }) {
  if (!String(name || '').trim() || !String(phone || '').trim()) throw Object.assign(new Error('Customer name and phone are required.'), { status: 400 });
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (requireEmail && !emailPattern.test(cleanEmail)) throw Object.assign(new Error('Enter a valid email address so we can send order updates.'), { status: 400 });
  if (cleanEmail && !emailPattern.test(cleanEmail)) throw Object.assign(new Error('Enter a valid customer email address.'), { status: 400 });
  if (!['Collection', 'Dine in'].includes(type) || !Array.isArray(items) || !items.length || items.length > 30) throw Object.assign(new Error('Choose a valid order type and at least one product.'), { status: 400 });
  const quantities = new Map();
  for (const item of items) { const id = Number(item.id), qty = Number(item.qty); if (!Number.isInteger(id) || id < 1 || !Number.isInteger(qty) || qty < 1 || qty > 50) throw Object.assign(new Error('Invalid product or quantity.'), { status: 400 }); quantities.set(id, (quantities.get(id) || 0) + qty); }
  const ids = [...quantities.keys()]; const products = await Product.find({ id: { $in: ids }, active: true });
  if (products.length !== ids.length) throw Object.assign(new Error('A selected product is unavailable. Refresh the menu.'), { status: 400 });
  const byId = new Map(products.map(x => [x.id, x]));
  const orderItems = ids.map(id => { const product = byId.get(id); return { product_id: id, product_name: product.name, quantity: quantities.get(id), unit_price: product.price }; });
  const total = orderItems.reduce((sum, x) => sum + x.unit_price * x.quantity, 0);
  const code = `BH-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const order = await Order.create({ order_code: code, customer_name: String(name).trim().slice(0, 120), customer_phone: String(phone).trim().slice(0, 40), customer_email: cleanEmail.slice(0, 254), order_type: type, notes: String(notes || '').slice(0, 1500), total, items: orderItems });
  return publicOrder(order);
}

app.get('/api/health', asyncRoute(async (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })));
app.get('/api/products', asyncRoute(async (_req, res) => { const rows = await Product.find({ active: true }).sort({ id: 1 }); res.json(rows.map(publicProduct)); }));
app.post('/api/orders', asyncRoute(async (req, res) => { const c = req.body?.customer || {}; const order = await makeOrder({ name: c.name, phone: c.phone, email: c.email, type: c.type, notes: c.notes, items: req.body?.items, requireEmail: true }); let notification; try { notification = await sendOrderEmail(order, 'Received', 'Thank you for placing an order with us.'); } catch (e) { console.error('Order confirmation email failed:', e.message); notification = { sent: false, reason: 'The order was saved, but the confirmation email could not be sent.' }; } res.status(201).json({ ...order, notification }); }));
app.post('/api/staff/login', asyncRoute(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase(), password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Enter your staff email and password.' });
  const staff = await Staff.findOne({ email });
  if (!staff || !(await bcrypt.compare(password, staff.password_hash))) return res.status(401).json({ error: 'Incorrect email or password.' });
  const token = jwt.sign({ id: staff.id, name: staff.full_name, email: staff.email, role: staff.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, staff: { name: staff.full_name, email: staff.email, role: staff.role } });
}));
app.get('/api/staff/me', auth, (req, res) => res.json({ staff: req.staff }));
app.get('/api/staff/orders', auth, asyncRoute(async (_req, res) => { const orders = await Order.find().sort({ createdAt: -1 }); res.json(orders.map(publicOrder)); }));
app.patch('/api/staff/orders/:code/status', auth, asyncRoute(async (req, res) => {
  if (!statuses.includes(req.body?.status)) return res.status(400).json({ error: 'Invalid order status.' });
  const existing = await Order.findOne({ order_code: req.params.code });
  if (!existing) return res.status(404).json({ error: 'Order not found.' });
  const previousStatus = existing.status;
  existing.status = req.body.status;
  await existing.save();
  const orderData = publicOrder(existing);
  let notification = { sent: false, reason: 'Status was unchanged.' };
  if (previousStatus !== existing.status) {
    try { notification = await sendOrderEmail(orderData, existing.status); }
    catch (e) { console.error('Status notification email failed:', e.message); notification = { sent: false, reason: 'Status was updated, but the email could not be sent.' }; }
  }
  res.json({ success: true, order: orderData, notification });
}));
app.post('/api/staff/orders', auth, asyncRoute(async (req, res) => { const b = req.body || {}; const order = await makeOrder({ name: b.name, phone: b.phone, email: b.email, type: b.type, notes: b.notes, items: b.items }); let notification; try { notification = await sendOrderEmail(order, 'Received', 'A Brew Haven team member has entered an order for you.'); } catch (e) { console.error('Counter-order email failed:', e.message); notification = { sent: false, reason: 'The order was saved, but the email could not be sent.' }; } res.status(201).json({ ...order, notification }); }));
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong on the server. Check the API logs and database connection.' }); });
connectDatabase().then(() => app.listen(PORT, () => console.log(`Brew Haven API running on port ${PORT}`))).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
