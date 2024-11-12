// WeatherAPI.js
import axios from "axios";
// Base URL for WeatherAPI

// Function to fetch weather data for a given city
export const getWeatherData = async (city) => {
  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=1b205e9e853f47b2baa120744242409&q=${city}`
    );
    return response.data; // Return the weather data
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error; // Rethrow the error to handle it later
  }
};
