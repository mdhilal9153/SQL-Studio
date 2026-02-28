require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const { GoogleGenAI } = require('@google/genai');

const Assignment = require('./models/Assignment');

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pgPool.on('error', (err) => {
  console.error('Unexpected pg client error:', err.message);
});

pgPool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL'))
  .catch((err) => console.error('Neon connection error:', err));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find({});
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

app.get('/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

const FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE'];

const isSafeQuery = (query) => {
  if (!query || typeof query !== 'string') return false;
  const normalized = query.toUpperCase().replace(/\s+/g, ' ').trim();
  return !FORBIDDEN_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`);
    return regex.test(normalized);
  });
};

app.post('/assignments/execute', async (req, res) => {
  const { query, assignmentId } = req.body;

  if (!query || !assignmentId) {
    return res.status(400).json({ success: false, error: "Query and assignment ID are required." });
  }

  if (!isSafeQuery(query)) {
    return res.status(400).json({ success: false, error: "Only SELECT queries are allowed. Destructive operations are not permitted." });
  }

  const client = await pgPool.connect();

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment?.solutionQuery) {
      return res.status(400).json({ success: false, error: "No solution found for this assignment." });
    }

    await client.query('BEGIN');
    const userResult = await client.query(query);
    const solutionResult = await client.query(assignment.solutionQuery);
    await client.query('ROLLBACK');

    const isCorrect = JSON.stringify(userResult.rows) === JSON.stringify(solutionResult.rows);

    res.json({ success: true, isCorrect, rows: userResult.rows });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

app.post('/assignments/hint', async (req, res) => {
  const { description, userQuery, schema } = req.body;

  try {
    const prompt = `
      You are an expert SQL tutor. A student is trying to solve this problem:
      "${description}"
      
      Here is the database schema:
      ${schema}

      Here is their current SQL code:
      ${userQuery}

      Provide a short, 2-sentence hint to help them get closer to the solution. 
      DO NOT give them the exact final query. Guide them on what concept to use (like JOIN, GROUP BY, or a specific WHERE clause).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ success: true, hint: response.text });
  } catch (err) {
    console.error("Hint error:", err);
    res.status(500).json({ success: false, error: "Failed to generate hint." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
