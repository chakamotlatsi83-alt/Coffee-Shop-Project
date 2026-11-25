import 'dotenv/config';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { connectDatabase, Staff } from '../server/db.js';
const rl = readline.createInterface({ input, output });
try {
  await connectDatabase();
  const name = (await rl.question('Staff full name: ')).trim();
  const email = (await rl.question('Staff email: ')).trim().toLowerCase();
  const password = await rl.question('Temporary password (minimum 12 characters): ');
  if (!name || !email.includes('@') || password.length < 12) throw new Error('Enter a name, valid email, and password of at least 12 characters.');
  if (await Staff.exists({ email })) throw new Error('A staff account with that email already exists.');
  await Staff.create({ full_name: name, email, password_hash: await bcrypt.hash(password, 12), role: 'manager' });
  console.log(`Staff account created for ${email}. Keep the password private.`);
} catch (e) { console.error(e.message); process.exitCode = 1; } finally { rl.close(); await (await import('mongoose')).default.disconnect().catch(() => {}); }
