import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plants from './PlantData';

const Quiz = () => {
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [isCorrect, setIsCorrect] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const currentPlant = plants[currentPlantIndex];

  useEffect(() => {
    if (showImage) {
      fetchPlantImage(currentPlant.latinName);
    }
  }, [currentPlantIndex, showImage]);

  const fetchPlantImage = async (latinName) => {
    try {
      // Search for the plant on Wikipedia
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${latinName}&format=json&origin=*`;
      console.log('Searching for:', searchUrl);
      const searchResponse = await axios.get(searchUrl);
      console.log('Search response from Wikipedia:', searchResponse.data);

      // Get the first search result
      const searchResults = searchResponse.data.query.search;
      if (searchResults.length > 0) {
        const pageTitle = searchResults[0].title;

        // Fetch the images for the first search result
        const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${pageTitle}&prop=images&format=json&origin=*`;
        console.log('Fetching images from:', imagesUrl);
        const imagesResponse = await axios.get(imagesUrl);
        console.log('Images response from Wikipedia:', imagesResponse.data);

        const pages = imagesResponse.data.query.pages;
        const page = Object.values(pages)[0];

        if (page && page.images && page.images.length > 0) {
          // Get the first image URL
          const firstImageTitle = page.images[0].title;

          // Fetch the image URL
          const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${firstImageTitle}&prop=imageinfo&iiprop=url&format=json&origin=*`;
          console.log('Fetching image URL from:', imageUrl);
          const imageResponse = await axios.get(imageUrl);
          console.log('Image URL response from Wikipedia:', imageResponse.data);

          const imagePages = imageResponse.data.query.pages;
          const imagePage = Object.values(imagePages)[0];

          if (imagePage && imagePage.imageinfo && imagePage.imageinfo.length > 0) {
            setImageUrl(imagePage.imageinfo[0].url);
          } else {
            console.warn('No image URL found for:', firstImageTitle);
            setImageUrl('');
          }
        } else {
          console.warn('No images found for:', pageTitle);
          setImageUrl('');
        }
      } else {
        console.warn('No search results found for:', latinName);
        setImageUrl('');
      }
    } catch (error) {
      console.error('Error fetching the plant image:', error);
      setImageUrl('');
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
        imageUrl ? (
          <img src={imageUrl} alt={currentPlant.englishName} style={{ width: '300px', height: '300px' }} />
        ) : (
          <p>Loading image...</p>
        )
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