import { fetchData } from "./fetchData.js";
import { restaurants } from "../public/wep_page.js";

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

// gets every restaurant
async function getRestaurants() {
  try {
    const fetchedRestaurants = await fetchData(apiUrl + '/restaurants');
    restaurants.length = 0; // Clear the array without reassigning
    return restaurants.push(...fetchedRestaurants); // Add new data to the array
  } catch (error) {
    console.error(error);
  }
};

// gets restaurant data by id
async function getRestaurantById(id) {
  try {
    const restaurant = await fetchData(apiUrl + `/restaurants/${id}`);
    return restaurant;
  } catch (error) {
    console.error(error);
  }
};
  
// gets restaurants daily menu
async function getDailyMenu(id, lang) {
  try {
    return await fetchData(`${apiUrl}/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
};

// gets restaurants weekly menu
async function getWeeklyMenu(id, lang) {
  try {
    return await fetchData(`${apiUrl}/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
};

function error(err) {
    return console.warn(`ERROR(${err.code}): ${err.message}`);
};

export { getRestaurants, getDailyMenu, getWeeklyMenu, getRestaurantById, error };