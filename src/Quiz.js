import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plants from './PlantData';
import './App.css';

const Quiz = () => {
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [displayMode, setDisplayMode] = useState('both'); // 'both', 'image', or 'name'
  const [isCorrect, setIsCorrect] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [hintIndex, setHintIndex] = useState(0);

  const currentPlant = plants[currentPlantIndex];

  useEffect(() => {
    if (displayMode !== 'name') {
      fetchPlantImage(currentPlant.latinName, currentPlant.englishName);
    }
  }, [currentPlantIndex, displayMode]);

  const fetchPlantImage = async (latinName, englishName) => {
    try {
      const searchResult = await searchImage(latinName);
      if (!searchResult) {
        console.warn('No valid image found for Latin name, trying English name:', englishName);
        await searchImage(englishName);
      }
    } catch (error) {
      console.error('Error fetching the plant image:', error);
      setImageUrl('');
    }
  };

  const searchImage = async (name) => {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${name}&format=json&origin=*`;
      const searchResponse = await axios.get(searchUrl);
      const searchResults = searchResponse.data.query.search;

      if (searchResults.length > 0) {
        const pageTitle = searchResults[0].title;
        const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${pageTitle}&prop=images&format=json&origin=*`;
        const imagesResponse = await axios.get(imagesUrl);

        const pages = imagesResponse.data.query.pages;
        const page = Object.values(pages)[0];

        if (page && page.images && page.images.length > 0) {
          let imageIndex = 0;
          let validImageUrl = '';

          while (imageIndex < page.images.length) {
            const imageTitle = page.images[imageIndex].title;
            const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${imageTitle}&prop=imageinfo&iiprop=url&format=json&origin=*`;
            const imageResponse = await axios.get(imageUrl);

            const imagePages = imageResponse.data.query.pages;
            const imagePage = Object.values(imagePages)[0];

            if (imagePage && imagePage.imageinfo && imagePage.imageinfo.length > 0) {
              const url = imagePage.imageinfo[0].url;
              if (!url.endsWith('.svg')) {
                validImageUrl = url;
                break;
              }
            }
            imageIndex++;
          }

          if (validImageUrl) {
            setImageUrl(validImageUrl);
            return true;
          } else {
            console.warn('No valid image URL found for:', pageTitle);
            setImageUrl('');
            return false;
          }
        } else {
          console.warn('No images found for:', pageTitle);
          setImageUrl('');
          return false;
        }
      } else {
        console.warn('No search results found for:', name);
        setImageUrl('');
        return false;
      }
    } catch (error) {
      console.error('Error fetching the plant image:', error);
      setImageUrl('');
      return false;
    }
  };

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
    setHintIndex(0);
    const nextIndex = (currentPlantIndex + 1) % plants.length;
    setCurrentPlantIndex(nextIndex);
  };

  const toggleDisplay = () => {
    if (displayMode === 'both') {
      setDisplayMode('image');
    } else if (displayMode === 'image') {
      setDisplayMode('name');
    } else {
      setDisplayMode('both');
    }
  };

  const revealHint = () => {
    let newHintIndex = hintIndex + 1;
    while (newHintIndex < currentPlant.latinName.length && currentPlant.latinName[newHintIndex] === ' ') {
      newHintIndex++;
    }
    setHintIndex(newHintIndex);
  };

  const getHint = () => {
    return currentPlant.latinName
      .split('')
      .map((char, index) => (index < hintIndex || char === ' ' ? char : '_'))
      .join('');
  };

  return (
    <div className="container">
      <div>
        <button
          className={`toggle-button ${displayMode === 'both' ? 'selected' : 'not-selected'}`}
          onClick={() => setDisplayMode('both')}
        >
          Both
        </button>
        <button
          className={`toggle-button ${displayMode === 'image' ? 'selected' : 'not-selected'}`}
          onClick={() => setDisplayMode('image')}
        >
          Image Only
        </button>
        <button
          className={`toggle-button ${displayMode === 'name' ? 'selected' : 'not-selected'}`}
          onClick={() => setDisplayMode('name')}
        >
          Name Only
        </button>
      </div>
      <h1>Plant Quiz</h1>
      <p>Score: {score}</p>
      {displayMode !== 'name' && (
        imageUrl ? (
          <img src={imageUrl} alt={currentPlant.englishName} style={{ width: '300px', height: '300px' }} />
        ) : (
          <p>Loading image...</p>
        )
      )}
      {displayMode !== 'image' && <h2>{currentPlant.englishName}</h2>}
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
        <button onClick={revealHint}>Hint</button>
        <p className="hint">{getHint()}</p>
        <button onClick={nextQuestion}>Next</button>
      </div>
    </div>
  );
};

export default Quiz;