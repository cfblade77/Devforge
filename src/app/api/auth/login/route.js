import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/app/models/User';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    // Parse incoming request data
    const { identifier, password } = await req.json();

    // Connect to MongoDB
    await connectToDatabase();

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    // If user not found
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compare input password with stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Construct absolute URL for redirect
    const url = new URL('http://localhost:3000/', req.url); // This will create the absolute URL

    // Redirect to the home page
    return NextResponse.redirect(url);

  } catch (error) {
    console.error("Error during login:", error); // Log the error for debugging
    return NextResponse.json({ error: 'Error during login' }, { status: 500 });
  }
}
