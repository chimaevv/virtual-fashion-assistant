// src/MainDashboard.js
import React, { useState } from 'react';
import Avatar from './Avatar';
import './MainDashboard.css';
import { recommendations } from './recommendations';

function MainDashboard({ gender, style }) {
  const [weatherData, setWeatherData] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherByManualLocation = async () => {
    if (!manualLocation) {
      setError('Please enter a location.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

      if (!apiKey) {
        setError(
          'API key is missing. Please set REACT_APP_WEATHER_API_KEY in your environment variables.'
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
          manualLocation
        )}`
      );
      const data = await response.json();

      console.log('API Response:', data);

      if (data.error) {
        setError(data.error.message);
        setWeatherData(null);
      } else {
        setWeatherData(data);
        setError(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching data.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getOutfitRecommendation = () => {
    if (!weatherData) return '';

    const temp = weatherData.current.temp_f;

    let tempCategory = '';
    if (temp <= 50) {
      tempCategory = 'cold';
    } else if (temp > 50 && temp <= 68) {
      tempCategory = 'cool';
    } else {
      tempCategory = 'warm';
    }

    const recommendation =
      recommendations[gender]?.[style]?.[tempCategory] ||
      'Based on your preferences, we recommend comfortable attire suitable for the weather.';

    return recommendation;
  };

  return (
    <div className="dashboard">
      <h1>What Should I Wear Today?</h1>
      {!weatherData && (
        <div>
          <p>Please enter your location:</p>
          <input
            type="text"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="Enter city or ZIP code"
          />
          <button onClick={fetchWeatherByManualLocation}>Submit</button>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
      {loading && <p>Loading weather data...</p>}
      {weatherData && (
        <>
          <div className="weather-info">
            <p>
              <strong>Location:</strong> {weatherData.location.name},{' '}
              {weatherData.location.country}
            </p>
            <p>
              <strong>Temperature:</strong> {weatherData.current.temp_f}°F
            </p>
            <p>
              <strong>Condition:</strong> {weatherData.current.condition.text}
            </p>
            <img
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
              className="weather-icon"
            />
          </div>
          <Avatar weatherData={weatherData} />
          <div className="outfit-recommendation">
            <p>
              <strong>Outfit Recommendation:</strong>
            </p>
            <p>{getOutfitRecommendation()}</p>
          </div>
          <button
            onClick={() => {
              setWeatherData(null);
              setManualLocation('');
              setError(null);
            }}
          >
            Search Another Location
          </button>
        </>
      )}
    </div>
  );
}

export default MainDashboard;
