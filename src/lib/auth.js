// lib/auth.js
import bcrypt from 'bcrypt';
import clientPromise from './db';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createUser(email, password) {
  const client = await clientPromise;
  const db = client.db('your-database-name');
  const hashedPassword = await hashPassword(password);
  const user = { email, password: hashedPassword };

  await db.collection('users').insertOne(user);
  return user;
}

export async function findUserByEmail(email) {
  const client = await clientPromise;
  const db = client.db('your-database-name');
  return await db.collection('users').findOne({ email });
}
