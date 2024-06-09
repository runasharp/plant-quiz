// src/Quiz.js
import React, { useState } from 'react';
import plants from './PlantData';

const Quiz = () => {
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [isCorrect, setIsCorrect] = useState(null);

  const currentPlant = plants[currentPlantIndex];

  const checkAnswer = () => {
    if (answer.toLowerCase() === currentPlant.latinName.toLowerCase()) {
      setScore(score + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const nextQuestion = () => {
    setIsCorrect(null);
    setAnswer('');
    const nextIndex = (currentPlantIndex + 1) % plants.length;
    setCurrentPlantIndex(nextIndex);
  };

  const toggleDisplay = () => {
    setShowImage(!showImage);
  };

  return (
    <div>
      <button className="toggle-button" onClick={toggleDisplay}>
        {showImage ? 'Show Name' : 'Show Image'}
      </button>
      <h1>Plant Quiz</h1>
      <p>Score: {score}</p>
      {showImage ? (
        <img src={currentPlant.imageUrl} alt={currentPlant.englishName} style={{ width: '300px', height: '300px' }} />
      ) : (
        <h2>{currentPlant.englishName}</h2>
      )}
      <div>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter Latin name"
        />
        <button onClick={checkAnswer}>Submit</button>
        {isCorrect !== null && (
          <p>{isCorrect ? 'Correct!' : `Wrong! The correct answer is ${currentPlant.latinName}`}</p>
        )}
        <button onClick={nextQuestion}>Next</button>
      </div>
    </div>
  );
};

export default Quiz;