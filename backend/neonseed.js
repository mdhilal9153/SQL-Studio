// backend/neon-seed.js
require('dotenv').config();
const { Client } = require('pg');

const seedNeonDatabase = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🐘 Connected to Neon PostgreSQL...');

    console.log('🗑️  Clearing old tables...');
    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS inventory CASCADE;
    `);

    console.log('🔨 Creating the 3 core tables and inserting data...');
    await client.query(`
      -- 1. USERS TABLE
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY, 
        name VARCHAR(100), 
        country VARCHAR(50)
      );
      INSERT INTO users (name, country) VALUES
      ('Alice Johnson', 'USA'), ('Bob Smith', 'UK'), 
      ('Charlie Brown', 'USA'), ('Diana Prince', 'Canada'),
      ('Evan Wright', 'UK');

      -- 2. PRODUCTS TABLE
      CREATE TABLE products (
        product_id SERIAL PRIMARY KEY, 
        product_name VARCHAR(100), 
        category VARCHAR(50), 
        price DECIMAL(10, 2), 
        stock INT
      );
      INSERT INTO products (product_name, category, price, stock) VALUES
      ('Laptop', 'Electronics', 999.99, 50),
      ('Wireless Mouse', 'Electronics', 25.00, 0),
      ('Coffee Mug', 'Home', 15.50, 100),
      ('Mechanical Keyboard', 'Electronics', 120.00, 15),
      ('Desk Lamp', 'Home', 45.00, 0);

      -- 3. ORDERS TABLE (The Join Table)
      CREATE TABLE orders (
        order_id SERIAL PRIMARY KEY, 
        user_id INT REFERENCES users(user_id), 
        product_id INT REFERENCES products(product_id), 
        quantity INT, 
        order_date DATE
      );
      INSERT INTO orders (user_id, product_id, quantity, order_date) VALUES
      (1, 1, 1, '2025-10-01'), (1, 2, 2, '2025-10-05'),
      (2, 4, 1, '2025-10-12'), (3, 3, 5, '2025-11-02'),
      (1, 4, 1, '2025-11-15'), (4, 1, 2, '2025-11-20');
    `);

    console.log('🌱 Successfully seeded Neon database with the 3-table schema!');
  } catch (error) {
    console.error('❌ Error seeding Neon:', error);
  } finally {
    await client.end();
  }
};

seedNeonDatabase();