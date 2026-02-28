import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Navbar from '../components/Navbar';

const Workspace = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [userQuery, setUserQuery] = useState('-- Write your SQL query here\n');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [hint, setHint] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);

  useEffect(() => {
    const fetchSingleChallenge = async () => {
      try {
        const res = await fetch(`http://localhost:5000/assignments/${id}`);
        const data = await res.json();
        setAssignment(data);
      } catch (err) {
        console.error("Couldn't load challenge:", err);
      }
    };
    fetchSingleChallenge();
  }, [id]);

  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    setError(null);
    setResults(null);
    setEvaluation(null);

    try {
      const res = await fetch('http://localhost:5000/assignments/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, assignmentId: id })
      });
      const data = await res.json();

      if (data.success) {
        setResults(data.rows);
        setEvaluation(data.isCorrect);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Couldn't reach the server. Is it running?");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleGetHint = async () => {
    setIsHintLoading(true);
    setHint('');

    try {
      const res = await fetch('http://localhost:5000/assignments/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: assignment.description,
          schema: assignment.schemaContext,
          userQuery
        })
      });

      const data = await res.json();
      setHint(data.success ? data.hint : "AI tutor is unavailable right now.");
    } catch (err) {
      setHint("Failed to fetch hint.");
    } finally {
      setIsHintLoading(false);
    }
  };

  if (!assignment) return <div className="workspace-loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="workspace-container">
        <div className="problem-panel">
          <div className="problem-header">
            <h2>{assignment.title}</h2>
            <span className={`badge badge-${assignment.difficulty.toLowerCase()}`}>
              {assignment.difficulty}
            </span>
          </div>

          <div className="problem-description">
            <h3>Problem Description</h3>
            <p>{assignment.description}</p>
          </div>

          {hint && (
            <div className="ai-hint-box">
              <h4>💡 AI Tutor Hint</h4>
              <p>{hint}</p>
            </div>
          )}

          <div className="problem-schema">
            <h3>Database Schema</h3>
            <pre>{assignment.schemaContext}</pre>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-header">
            <h3>SQL Editor</h3>
            <div className="button-group">
              <button className="hint-btn" onClick={handleGetHint} disabled={isHintLoading}>
                {isHintLoading ? 'Thinking...' : '✨ Get AI Hint'}
              </button>
              <button className="run-btn" onClick={handleExecuteQuery} disabled={isExecuting}>
                {isExecuting ? 'Running...' : 'Execute Query'}
              </button>
            </div>
          </div>

          <div className="monaco-container">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={userQuery}
              onChange={(value) => setUserQuery(value)}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>

          <div className="results-panel">
            {evaluation !== null && !error && (
              <div className={`evaluation-banner ${evaluation ? 'correct' : 'incorrect'}`}>
                {evaluation
                  ? '✅ Correct! Your output matches the expected solution.'
                  : '❌ Incorrect. Your output does not match the expected solution.'}
              </div>
            )}

            {error && <div className="error-message"><strong>Error:</strong> {error}</div>}

            {results && results.length > 0 && (
              <div className="table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      {Object.keys(results[0]).map((key) => <th key={key}>{key}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val !== null ? val.toString() : 'NULL'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Workspace;
