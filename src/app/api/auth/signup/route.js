import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/app/models/User';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    // Parse the incoming request data
    const { username, email, password,role } = await req.json();

    // Connect to MongoDB
    await connectToDatabase();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    // Save the user in the database
    await newUser.save();

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
