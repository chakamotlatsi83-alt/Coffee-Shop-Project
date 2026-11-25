import mongoose from 'mongoose';

const { Schema } = mongoose;
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const productSchema = new Schema({
  id: { type: Number, unique: true, index: true }, name: { type: String, required: true, trim: true },
  category: { type: String, required: true }, description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 }, image_url: { type: String, default: '' },
  tag: { type: String, default: null }, active: { type: Boolean, default: true }
}, { timestamps: true });
const staffSchema = new Schema({ full_name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true, index: true }, password_hash: { type: String, required: true }, role: { type: String, default: 'manager' } }, { timestamps: true });
const orderItemSchema = new Schema({ product_id: Number, product_name: String, quantity: Number, unit_price: Number }, { _id: false });
const orderSchema = new Schema({
  order_code: { type: String, unique: true, index: true }, customer_name: String, customer_phone: String, customer_email: { type: String, lowercase: true, trim: true, default: '' },
  order_type: { type: String, enum: ['Collection', 'Dine in'] }, notes: { type: String, default: '' },
  total: Number, status: { type: String, default: 'Received' }, items: [orderItemSchema]
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Configure your MongoDB Atlas connection string.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB:', mongoose.connection.name);
}
export async function nextProductId() {
  const counter = await Counter.findByIdAndUpdate('products', { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return counter.seq;
}
