import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { connectDatabase, Product, nextProductId } from '../server/db.js';
const rl = readline.createInterface({ input, output });
try {
  await connectDatabase();
  const name = (await rl.question('Menu item name: ')).trim();
  const category = (await rl.question('Category (Coffee, Tea, Milkshakes, Cookies, Snacks): ')).trim();
  const description = (await rl.question('Description: ')).trim();
  const price = Number(await rl.question('Price (LSL): '));
  const image_url = (await rl.question('Image URL (optional): ')).trim();
  const tag = (await rl.question('Tag (optional): ')).trim();
  if (!name || !category || !Number.isFinite(price) || price <= 0) throw new Error('Name, category and a positive price are required.');
  if (await Product.exists({ name })) throw new Error('A menu item with this name already exists.');
  const product = await Product.create({ id: await nextProductId(), name, category, description, price, image_url, tag: tag || null, active: true });
  console.log(`Added ${product.name} to the persistent MongoDB menu (ID ${product.id}).`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { rl.close(); const mongoose = (await import('mongoose')).default; await mongoose.disconnect().catch(() => {}); }
