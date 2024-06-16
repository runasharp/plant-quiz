import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plants from './PlantData';
import './App.css';

const Quiz = () => {
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const [order, setOrder] = useState([...Array(plants.length).keys()]);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [displayMode, setDisplayMode] = useState('both'); // 'both', 'image', or 'name'
  const [isCorrect, setIsCorrect] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [dropdownIndex, setDropdownIndex] = useState(-1); // -1 will represent "All"

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const reverseOrder = () => {
    setOrder([...order].reverse());
    setCurrentPlantIndex(0);
  };

  const randomizeOrder = () => {
    setOrder(shuffleArray([...order]));
    setCurrentPlantIndex(0);
  };

  const resetOrder = () => {
    setOrder([...Array(plants.length).keys()]);
    setCurrentPlantIndex(0);
  };

  const currentPlant = plants[order[currentPlantIndex]];

  useEffect(() => {
    const fetchAllImages = async () => {
      const urls = await Promise.all(
        plants.map(async (plant) => {
          const latinName = plant.latinName;
          const englishName = plant.englishName;
          const url = await fetchPlantImage(latinName) || await fetchPlantImage(englishName) || await fetchFallbackImage(latinName);
          return url || '';
        })
      );
      setImageUrls(urls);
    };

    fetchAllImages();
  }, []);

  const fetchPlantImage = async (name) => {
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
          for (let image of page.images) {
            const imageTitle = image.title;
            if (imageTitle.toLowerCase().includes('flag') || imageTitle.toLowerCase().includes('logo')) {
              continue; // Skip unwanted images
            }
            const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${imageTitle}&prop=imageinfo&iiprop=url&format=json&origin=*`;
            const imageResponse = await axios.get(imageUrl);

            const imagePages = imageResponse.data.query.pages;
            const imagePage = Object.values(imagePages)[0];

            if (imagePage && imagePage.imageinfo && imagePage.imageinfo.length > 0) {
              const url = imagePage.imageinfo[0].url;
              if (!url.endsWith('.svg')) {
                return url;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching the plant image:', error);
    }
    return null;
  };

  const fetchFallbackImage = async (name) => {
    try {
      const fallbackUrl = `https://api.example.com/search?query=${name}`;
      const response = await axios.get(fallbackUrl);
      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results[0].imageUrl;
      }
    } catch (error) {
      console.error('Error fetching fallback image:', error);
    }
    return null;
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
    const nextIndex = (currentPlantIndex + 1) % order.length;
    setCurrentPlantIndex(nextIndex);
  };

  const previousQuestion = () => {
    setIsCorrect(null);
    setAnswer('');
    setHintIndex(0);
    const prevIndex = (currentPlantIndex - 1 + order.length) % order.length;
    setCurrentPlantIndex(prevIndex);
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

  const handleDropdownChange = (e) => {
    const newDropdownIndex = parseInt(e.target.value);
    setDropdownIndex(newDropdownIndex);
    if (newDropdownIndex === -1) {
      setOrder([...Array(plants.length).keys()]);
    } else {
      const newOrder = plants.slice(newDropdownIndex * 10, (newDropdownIndex + 1) * 10).map((_, index) => index + newDropdownIndex * 10);
      setOrder(newOrder);
    }
    setCurrentPlantIndex(0);
  };

  const getDropdownOptions = () => {
    const options = [
      <option key={-1} value={-1}>
        All
      </option>
    ];
    for (let i = 0; i < plants.length; i += 10) {
      options.push(
        <option key={i / 10} value={i / 10}>
          {`List ${i / 10 + 1}`}
        </option>
      );
    }
    return options;
  };

  useEffect(() => {
    if (dropdownIndex === -1) {
      console.log('Selected All:', plants);
      setOrder([...Array(plants.length).keys()]);
    } else {
      const selectedPlants = plants.slice(dropdownIndex * 10, (dropdownIndex + 1) * 10);
      console.log(`Selected List ${dropdownIndex + 1}:`, selectedPlants);
      setOrder(selectedPlants.map((_, index) => index + dropdownIndex * 10));
    }
    setCurrentPlantIndex(0);
  }, [dropdownIndex]);

  return (
    <div className="container">
      <header className="header">
        <div className="header-grid">
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
          <button onClick={resetOrder}>Normal Order</button>
          <button onClick={randomizeOrder}>Randomize</button>
          <button onClick={reverseOrder}>Reverse</button>
          <select onChange={handleDropdownChange} value={dropdownIndex}>
            {getDropdownOptions()}
          </select>
        </div>
      </header>
      <h1>Plant Quiz</h1>
     <p>Score: {score}</p>
      {displayMode !== 'name' && (
        imageUrls[order[currentPlantIndex]] ? (
          <img src={imageUrls[order[currentPlantIndex]]} alt={currentPlant.englishName} style={{ width: '300px', height: '300px' }} />
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
        <button onClick={previousQuestion}>Back</button>
        <button onClick={nextQuestion}>Next</button>
      </div>
    </div>
  );
};

export default Quiz;