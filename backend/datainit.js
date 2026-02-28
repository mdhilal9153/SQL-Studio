// backend/datainit.js
require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');

// The unified schema context to display on the frontend for all problems
const unifiedSchema = `CREATE TABLE users (user_id INT, name VARCHAR, country VARCHAR);
CREATE TABLE products (product_id INT, product_name VARCHAR, category VARCHAR, price DECIMAL, stock INT);
CREATE TABLE orders (order_id INT, user_id INT, product_id INT, quantity INT, order_date DATE);`;

const sampleAssignments = [
  {
    title: "High-Value Products",
    difficulty: "Easy",
    description: "Write a SQL query to list all products that cost more than $50. Return the 'product_name' and 'price'.",
    schemaContext: unifiedSchema,
    solutionQuery: "SELECT product_name, price FROM products WHERE price > 50;"
  },
  {
    title: "Out of Stock Items",
    difficulty: "Easy",
    description: "Identify all items that need to be reordered. Find all products where the stock is exactly 0. Return all columns.",
    schemaContext: unifiedSchema,
    solutionQuery: "SELECT * FROM products WHERE stock = 0;"
  },
  {
    title: "Customer Demographics",
    difficulty: "Medium",
    description: "Count the number of users located in each country. Return the 'country' and the count as 'user_count'.",
    schemaContext: unifiedSchema,
    solutionQuery: "SELECT country, COUNT(*) as user_count FROM users GROUP BY country;"
  },
  {
    title: "Total Sales Volume",
    difficulty: "Medium",
    description: "Calculate the total quantity of products sold for each product_id. Return 'product_id' and the sum of quantity as 'total_sold'.",
    schemaContext: unifiedSchema,
    solutionQuery: "SELECT product_id, SUM(quantity) as total_sold FROM orders GROUP BY product_id;"
  },
  {
    title: "Top Spenders",
    difficulty: "Hard",
    description: "Find the users who have spent the most money in total. You will need to join users, orders, and products. Return the user's 'name' and their total amount spent as 'total_spent', ordered by highest spenders first.",
    schemaContext: unifiedSchema,
    solutionQuery: "SELECT u.name, SUM(o.quantity * p.price) as total_spent FROM users u JOIN orders o ON u.user_id = o.user_id JOIN products p ON o.product_id = p.product_id GROUP BY u.name ORDER BY total_spent DESC;"
  },
  {
    title: "Unsold Inventory",
    difficulty: "Hard",
    description: "Find the products that have never been purchased by any user. Return the 'product_name' and 'category'.",
    schemaContext: unifiedSchema,
    solutionQuery: "SELECT product_name, category FROM products WHERE product_id NOT IN (SELECT product_id FROM orders);"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    await Assignment.deleteMany({});
    console.log('🗑️ Cleared old assignments');
    await Assignment.insertMany(sampleAssignments);
    console.log('🌱 Successfully injected 6 new SQL challenges!');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });