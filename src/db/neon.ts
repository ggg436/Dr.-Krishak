import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Use the provided connection string
const connectionString = 'postgresql://neondb_owner:npg_aWyRwHeT41rV@ep-misty-bird-a8emrqlr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

// Configure options for browser environment
const options = {
  fullResults: true // Return full result objects
};

// Create SQL query function with the connection
export const sql = neon(connectionString, options);

// Function to test the connection
export const testConnection = async () => {
  try {
    const result = await sql`SELECT 1 as test`;
    return { success: true, result };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error };
  }
};

// Initialize database by creating tables if they don't exist
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    
    // First test the connection
    const test = await testConnection();
    if (!test.success) {
      throw new Error('Connection test failed');
    }
    
    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_photo_url TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        tags TEXT[]
      )
    `;
    console.log('Posts table initialized');

    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_photo_url TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Comments table initialized');

    // Create likes table to track user likes
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `;
    console.log('Likes table initialized');

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Call this function when the app starts
export const setupDatabase = async () => {
  try {
    console.log('Setting up database connection...');
    const result = await initializeDatabase();
    console.log('Database setup completed:', result);
    return result;
  } catch (error) {
    console.error('Failed to set up database:', error);
    return false;
  }
}; 