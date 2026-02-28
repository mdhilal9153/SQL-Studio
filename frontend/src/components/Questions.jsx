import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load challenges:", err);
        setIsLoading(false);
      });
  }, []);

  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.challenge-item');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  };

  return (
    <div className='heading2'>
      <div>
        <h2>SQL Challenges</h2>
        <p>Choose a challenge to get started with your learning journey</p>
      </div>

      {isLoading ? (
        <p style={{ marginTop: '2rem' }}>Loading challenges...</p>
      ) : (
        <div className="challenges-list" onMouseMove={handleMouseMove}>
          {challenges.map((challenge) => (
            <div key={challenge._id} className="challenge-item">
              <div className="card-content">
                <div className="item-header">
                  <h3>{challenge.title}</h3>
                  <span className={`badge badge-${challenge.difficulty?.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p>{challenge.description}</p>
                <button onClick={() => navigate(`/assignment/${challenge._id}`)}>
                  Solve Challenge <ArrowRight size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questions;
