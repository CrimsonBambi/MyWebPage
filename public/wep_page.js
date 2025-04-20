'use strict';

import { login, getCurrentUserProfile, usernameAvailability, updateUserData } from "../api/login.js";
import {uploadAvatarFile } from "../api/avatar.js";
import { getRestaurants, getDailyMenu, getWeeklyMenu, getRestaurantById, error } from "../api/restaurant.js";
import { registerUser } from "../api/register.js";
export const restaurants = []; // Export the restaurants array

let map; // Declare map globally
const markers = new Map(); // Store markers with restaurant IDs as keys
const table = document.getElementById('restaurant-table');
const menuCity = document.getElementById('menu-city');
const searchButton = document.getElementById('search-button');
const label = document.getElementById('selected-restaurant-label');
const welcome = document.getElementById('user-welcome'); // div
const logoutLink = document.getElementById('logout-link');
const updateProfile = document.getElementById('update-profile-form');
const heart = document.getElementById('heart');
let selectedRestaurantId = null;
const faveRest = document.getElementById('favRestaurant-container');


//favourite-restaurant-menu reference 
const favRestaurantLink = document.getElementById('favRestaurant-container-link'); // link is created in welcomeUser();
const favRestContent = document.getElementById('favRest-menu-content');
const favRestModal = document.getElementById('favourite-restaurant-menu');
const closeFavRest = document.getElementById('close-favRest-menu');
// todays-menu reference
const openDayMenu = document.getElementById('open-today-menu');
const todayContent = document.getElementById('today-menu-content');
const todayModal = document.getElementById('today-menu');
const closeTodayModal = document.getElementById('close-today-menu');
// weekly-menu refence
const openWeekMenu = document.getElementById('open-week-menu');
const weekContent = document.getElementById('week-menu-content');
const weekModal = document.getElementById('week-menu');
const closeWeekModal = document.getElementById('close-week-menu');
// login references
const openLogin = document.getElementById('open-login-modal');
const closeLogin = document.getElementById('close-login');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
// register references
const openRegister = document.getElementById('open-register-modal');
const closeRegister = document.getElementById('close-register');
const registerModal = document.getElementById('register-modal');
const registerForm = document.getElementById('register-form');
// settings reference
const openSettings = document.getElementById('open-settings');
const settingModal = document.getElementById('setting-modal');
const closeSettings = document.getElementById('close-settings');
// profile reference
const openProfile = document.getElementById('profile-link');
const closeProfile = document.getElementById('close-profile');
const profileModal = document.getElementById('profile-modal');
const profileLink = document.getElementById('profile-link');
//###########################################################


// Check if user is already logged in when the page loads
document.addEventListener('DOMContentLoaded', async (event) => {
  event.preventDefault();
  const storedToken = localStorage.getItem('token'); // Retrieve token from localStorage

  if (storedToken) {
    welcomeUser();
    showLinks();
  } else {
    hideLinks(); // hide links if not logged in
  }
});

// login
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const data = await login(username.value, password.value);

  if (data) {
    localStorage.setItem('token', data.token); // Store the token in localStorage
    showLinks();
    welcomeUser();
    loginModal.close(); // Close dialog only if login succeeded
  }
});

// logout
logoutLink.addEventListener('click', () => { 
  const storedToken = localStorage.getItem('token'); // Retrieve the token before clearing localStorage

  if (storedToken !== null) {
    console.log('Token before clearing:', storedToken);
    localStorage.clear(); // Clear all localStorage data
    selectedRestaurantId = null;

    openLogin.style.display = 'block';
    logoutLink.style.display = 'none';
    profileLink.style.display = 'none';
    welcome.style.display = 'none';
    faveRest.style.display = 'none';

    console.log('Token after clearing:', localStorage.getItem('token')); // Should log null
  } else {
    console.log('You are already logged out.');
  }
  console.log('Logged out');
});

// makes profile and logout links visible
function showLinks() {
  if (profileLink && logoutLink) {
    profileLink.style.display = 'block';
    logoutLink.style.display = 'block';
    openLogin.style.display = 'none';
  }
};

// hide links if logged out
function hideLinks() {
  localStorage.removeItem('token');
  openLogin.style.display = 'block';
  logoutLink.style.display = 'none';
  profileLink.style.display = 'none';
  welcome.style.display = 'none';
  faveRest.style.display = 'none';
  selectedRestaurantId = null;
};


// welcome logged in user
async function welcomeUser() {
  const text = document.getElementById('welcome-text');
  const avatar = document.getElementById('avatar');
  const storedToken = localStorage.getItem('token');
  const favRestHeader = document.getElementById('favRestHeader');

  try {
    const userData = await getCurrentUserProfile(storedToken);
    if (userData) {
      avatar.src = userData.avatar
        ? `https://media2.edu.metropolia.fi/restaurant/uploads/${userData.avatar}`
        : 'CSS/avatar.png';
    }
    if (userData.favouriteRestaurant) {
      const restaurantName = await getRestaurantById(userData.favouriteRestaurant);
      favRestHeader.textContent = 'Check today\'s Menu at your favourite restaurant!';
      favRestaurantLink.innerText = restaurantName; // Set the restaurant name on the link
      favRestaurantLink.dataset.restaurantId = userData.favouriteRestaurant; // Store the restaurant ID for later use
      faveRest.style.display = 'flex';
    } else {
      faveRest.style.display = 'none';
    }
    text.textContent = `Welcome, ${userData.username}!`;
    welcome.style.display = 'flex';
  } catch {
    alert('Failed to load user data. Please log in again.');
    hideLinks(); // Hide links if user data cannot be fetched
    return;
  }
}

// OPEN FAVOURITE RESTAURANTS MENU
favRestaurantLink.addEventListener('click', async (event) => {
  event.preventDefault();

  const storedToken = localStorage.getItem('token');
  const restaurantId = favRestaurantLink.dataset.restaurantId; // Get the restaurant ID from the dataset

  if (!restaurantId) {
    alert('Favorite restaurant ID not found.');
    return;
  }

  try {
    const restaurant = await getRestaurantById(restaurantId);
    if (restaurant) {
      const menu = await getWeeklyMenu(restaurantId, 'fi'); // Await the weekly menu data
      favRestContent.innerHTML = ''; // Clear previous content
      createModalHtml(restaurant, favRestContent); // Add restaurant details to the modal

      if (menu && menu.days && menu.days.length > 0) {
        const menuHtml = createWeeklyMenuHtml(menu.days); // Use 'days' for weekly menu
        favRestContent.insertAdjacentHTML('beforeend', menuHtml);
      } else {
        favRestContent.insertAdjacentHTML('beforeend', '<p>No weekly menu available.</p>');
      }
      favRestModal.showModal();
    } else {
      favRestContent.innerHTML = '<p>Restaurant information not found.</p>';
      favRestModal.showModal();
    }
  } catch (error) {
    console.error('Error fetching weekly menu or restaurant information:', error);
    alert('Failed to fetch the weekly menu or restaurant information. Please try again later.');
  }
});

// close favourite restaurant menu 
closeFavRest.addEventListener('click', () => {
  favRestModal.close();
});

// submits register form
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('confirm-register-password').value;

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

    if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  // Check if the username is available
  const isUsernameAvailable = await usernameAvailability(username);
  if (!isUsernameAvailable) {
    alert('Username is already taken. Please choose a different one.');
    return; // Prevent form submission if username is not available // Prevent form submission if username is not available
  }

  const userData = { username, email, password };

  try {
    const response = await registerUser(userData);
    console.log('Registration success:', response);
    alert('Registration successful! You can now log in.');
    registerModal.close();
  } catch (error) {
    console.error('Registration error:', error);
    alert(error.message || 'An error occurred during registration. Please try again.');
  }
});

// open todays menu
openDayMenu.addEventListener('click', async (event) => {
    event.preventDefault();
    const selectedRestaurantName = label.querySelector('h4')?.innerText; // currently selected restaurant name from the #selected-restaurant container

    if (!selectedRestaurantName) {
        alert('Please select a restaurant from the search first.');
        return;
    }

    const selectedRestaurant = restaurants.find(r => r.name === selectedRestaurantName); // Find the selected restaurant object

    if (!selectedRestaurant) {
        alert('Selected restaurant not found.');
        return;
    }

    try {
        todayContent.innerHTML = ''; // Clear previous content

        const dailyMenu = await getDailyMenu(selectedRestaurant._id, 'fi');
        createModalHtml(selectedRestaurant, todayContent); // Add restaurant details to the modal

        if (dailyMenu && dailyMenu.courses && dailyMenu.courses.length > 0) {
            const menuHtml = createMenuHtml(dailyMenu.courses);
            todayContent.insertAdjacentHTML('beforeend', menuHtml);
        } else {
            todayContent.insertAdjacentHTML('beforeend', '<p>No daily menu available.</p>');
        }

        todayModal.showModal();
    } catch (error) {
        console.error('Error fetching daily menu:', error);
        alert('Failed to fetch the daily menu. Please try again later.');
    }
});

// close today menu
closeTodayModal.addEventListener('click', () => {
  todayModal.close();
});

// open weekly menu
openWeekMenu.addEventListener('click', async (event) => {
    event.preventDefault();
    const selectedRestaurantName = label.querySelector('h4')?.innerText;

    if (!selectedRestaurantName) {
        alert('Please select a restaurant from the search first.');
        return;
    }

    const selectedRestaurant = restaurants.find(r => r.name === selectedRestaurantName);

    if (!selectedRestaurant) {
        alert('Selected restaurant not found.');
        return;
    }

    try {
        weekContent.innerHTML = '';

        const weeklyMenu = await getWeeklyMenu(selectedRestaurant._id, 'fi');
        createModalHtml(selectedRestaurant, weekContent); // Add restaurant details to the modal

        if (weeklyMenu && weeklyMenu.days && weeklyMenu.days.length > 0) {
            const menuHtml = createWeeklyMenuHtml(weeklyMenu.days);
            weekContent.insertAdjacentHTML('beforeend', menuHtml);
        } else {
            weekContent.insertAdjacentHTML('beforeend', '<p>No weekly menu available.</p>');
        }

        weekModal.showModal();
    } catch (error) {
        console.error('Error fetching weekly menu:', error);
        alert('Failed to fetch the weekly menu. Please try again later.');
    }
});

// close weekly menu
closeWeekModal.addEventListener('click', (event) => {
  weekModal.close();
});

// Open the login modal
openLogin.addEventListener('click', (event) => {
    event.preventDefault();
    loginModal.showModal(); 
});

// Close the login modal 
closeLogin.addEventListener('click', () => {
    loginModal.close(); 
});

// Open the register modal
openRegister.addEventListener('click', (event) => {
    event.preventDefault();
    registerModal.showModal(); 
});

// Close the register modal 
closeRegister.addEventListener('click', () => {
    registerModal.close(); 
});

// open profile
openProfile.addEventListener('click', async (event) => {
  event.preventDefault();

  const text = document.getElementById('info');
  const avatar = document.getElementById('profile-avatar');

  const name = document.createElement('h5');
  const email = document.createElement('h5');
  const favRestaurant = document.createElement('h5');

  const storedToken = localStorage.getItem('token');

  if (storedToken) {
    const userData = await getCurrentUserProfile(storedToken);
    if (userData) {
      name.textContent = `Username: ${userData.username}`;
      email.textContent = `Email: ${userData.email}`;

      if (userData.favouriteRestaurant) {
        const restaurant = await getRestaurantById(userData.favouriteRestaurant);
        favRestaurant.textContent = `Favourite Restaurant: ${restaurant}`;
      } else {
        favRestaurant.textContent = 'Favourite Restaurant: -';
      }

      // Set avatar image if available
      if (userData.avatar) {
        avatar.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${userData.avatar}`;
      } else {
        avatar.src = 'CSS/avatar.png'; // fallback default
      }
      text.innerHTML = '';
      text.append(name, email, favRestaurant);
    }
  }
  profileModal.showModal();
});

// close profile
closeProfile.addEventListener('click', () => {
  profileModal.close();
});

// open settings modal
openSettings.addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('update-username').value = '';
  document.getElementById('update-password').value = '';
  settingModal.showModal();
});

// close setting modal
closeSettings.addEventListener('click', () => {
  settingModal.close();
})

heart.addEventListener('click', async (event) => {
  event.preventDefault();
  const storedToken = localStorage.getItem('token');

  if (selectedRestaurantId !== null) {
    try {
      const updatedFavouriteRestauant = await updateUserData({favouriteRestaurant: selectedRestaurantId}, storedToken);
      if (updatedFavouriteRestauant) {
        alert('Favourite restaurant set');
        console.log('WITH ID: ', selectedRestaurantId);
        welcomeUser();
      }
    } catch {
      alert('Unable to set favourite restaurant');
    }
  }
});

// Update profile 
updateProfile.addEventListener('submit', async (event) => {
  event.preventDefault();

  const confirmUpdatePassword = document.getElementById('confirm-update-password');
  const updateUsername = document.getElementById('update-username');
  const updateEmail = document.getElementById('update-email');
  const updatePassword = document.getElementById('update-password');
  const avatarInput = document.getElementById('update-avatar');

  const storedToken = localStorage.getItem('token'); // Retrieve token from localStorage
  const file = avatarInput.files[0]; // Get the selected file

  if (storedToken) {
    const username = updateUsername.value.trim();
    const email = updateEmail.value.trim();
    const password = updatePassword.value;
    const confirmPassword = confirmUpdatePassword.value;

    const updates = {}; // Fields to be updated

    // Username validation
    if (username) {
      const availability = await usernameAvailability(username);
      if (!availability) {
        alert('Username is already taken.');
        return;
      }
      updates.username = username;
    }

    // Email validation
    if (email) {
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      updates.email = email;
    }

    // Password validation
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        alert('Password should be at least 6 characters.');
        return;
      }
      updates.password = password;
    }

    // Upload avatar if a file was selected
    if (avatarInput) {
      try {
        const uploadedFilename = await uploadAvatarFile(file, storedToken);
        updates.avatar = uploadedFilename; // Add the uploaded filename to updates
      } catch (error) {
        alert('Failed to upload avatar. Please try again.');
        return;
      }
    }

    if (Object.keys(updates).length === 0) { // If no fields filled
      alert('Please fill out at least one field to update.');
      return;
    }

    try {
      console.log(`About to update user with token ${storedToken}`);
      const updatedUser = await updateUserData(updates, storedToken); // Call the update function
      if (updatedUser) {
        if (updatedUser.username) {
          localStorage.setItem('username', updatedUser.username); // Replace saved username
        }
        alert('Profile updated successfully!');
        location.reload();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  }
});

// Event listener for the SEARCH button
searchButton.addEventListener('click', () => {
    const selectedCity = menuCity.value; // Get the selected city
    const filteredRestaurants = restaurants.filter(restaurant => restaurant.city === selectedCity); // Filter restaurants

    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>City</th>
        </tr>
    `;
    // filter restaurants
    filteredRestaurants.forEach(restaurant => {
        const tr = document.createElement('tr');
        
        // focus on the choosen restaurants marker
        tr.addEventListener('click', function () {
            const [longitude, latitude] = restaurant.location.coordinates; // Extract coordinates
            if (map) {
                map.flyTo([latitude, longitude], 15, {animate: true, duration: 0.5}); // Center the map on the restaurants location
                highlightMarker(restaurant._id); // Highlight the marker and empty previously selected restaurant container
            } else {
                console.error('Map is not initialized.');
            }

            // Create and append the new restaurant name
            const labelH = document.createElement('h4');
            labelH.innerText = restaurant.name;
            label.appendChild(labelH);
            // save clicked restaurant id
            selectedRestaurantId = restaurant._id;
            console.log("SELECTED RESTAURANT", selectedRestaurantId);
        });

        createRestaurantCells(restaurant, tr);
        table.appendChild(tr);
    });
});

//########################## html functions ##########################################

const defaultIcon = L.icon({
  iconUrl: 'http://maps.google.com/mapfiles/ms/micons/red-pushpin.png', // Default marker icon
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40]
});

const highlightedIcon = L.icon({
    iconUrl: 'http://maps.google.com/mapfiles/ms/micons/blue-pushpin.png', // Highlighted marker icon
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -40]
});

// highlights selected restaurants marker and clears previously #selected-restaurant container
function highlightMarker(restaurantId) {
  const marker = markers.get(restaurantId);
  label.textContent = '';
  label.style = '';
  if (marker) {  
    markers.forEach(m => m.setIcon(defaultIcon)); // Reset all markers to the default icon
    marker.setIcon(highlightedIcon).openPopup(); // Highlight the clicked marker and open its popup

    map.flyTo(marker.getLatLng(), 15, { // Adjust the map view to ensure the marker is fully visible
      animate: true,
      duration: 0.5 // Animation duration in seconds
    });
  }   
};

// creates table and appends all found restaurants
function createRestaurantCells(restaurant, tr) {
  const nameTd = document.createElement('td');
  nameTd.innerText = restaurant.name;
  const cityTd = document.createElement('td');
  cityTd.innerText = restaurant.city;
  tr.append(nameTd, cityTd);
};

// generates a table of restaurants + event for clicked restaurant option
function createTable() {
  for (const restaurant of restaurants) {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
        highlightMarker(restaurant._id); // highlight the restaurant on the map

        // Assign an object with the restaurant's name and ID
        selectedRestaurantId = restaurant._id;
        console.log("SELECTED RESTAURANT", selectedRestaurantId);

        const labelH = document.createElement('h4'); // creates & displays selected restaurant
        labelH.innerText = restaurant.name;
        label.append(labelH);
    });

    createRestaurantCells(restaurant, tr);
    table.appendChild(tr);
  }
};

// creates html for menu modal (restaurant info)
function createModalHtml(restaurant, modal) {
  const nameH3 = document.createElement('h2');
  nameH3.innerText = restaurant.name;
  const addressP = document.createElement('p');
  addressP.innerText = `${restaurant.address}, puhelin: ${restaurant.phone}`;
  modal.append(nameH3, addressP);
};

// creates daily menu html
function createMenuHtml(courses) {
  console.log(courses);
  let html = '';
  for (const course of courses) {
    html += `
    <article class="course">
        <p><strong>${course.name}</strong>,
        Hinta: ${course.price},
        Allergeenit: ${course.diets}</p>
    </article>
  `;
  }
  return html;
};

// creates weekly menu html
function createWeeklyMenuHtml(days) {
  let html = '';
  for (const day of days) {
      html += `
      <section class="day-menu">
        <br>
        <h2>${day.date}</h2>
      `;

    if (day.courses && day.courses.length > 0) {
      for (const course of day.courses) {
          html += `
          <article class="course">
              <p><strong>${course.name}</strong>, 
              Hinta: ${course.price || 'N/A'}, 
              Allergeenit: ${course.diets || 'N/A'}</p>
          </article>
          `;
      }
    } else {
        html += '<p>No courses available for this day.</p>';
      }
    html += '</section>';
  }
  return html;
};

// creates city options for search bar
function cityOption() {
  const cities = Array.from(new Set(restaurants.map(restaurant => restaurant.city))); 
  cities.sort();
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.innerText = city;
    menuCity.appendChild(option);
  });
};
  
// sorts restaurants order
function sortRestaurants() {
  restaurants.sort(function (a, b) {
    return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
  });
};

// initializes the a map centered on the user's current location
function success(pos) {
  const crd = pos.coords;
  map = L.map('map').setView([crd.latitude, crd.longitude], 13); // user location

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Add OpenStreetMap tiles
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const userIcon = L.icon({ 
    iconUrl: 'http://maps.google.com/mapfiles/ms/micons/grn-pushpin.png',
    iconSize: [30, 45], 
    iconAnchor: [15, 45], 
    popupAnchor: [0, -40],
  });

  L.marker([crd.latitude, crd.longitude], { icon: userIcon })
    .addTo(map)
    .bindPopup(`<b>Your Location</b><br>`)
    .openPopup();

  if (restaurants.length > 0) {  // Add markers after restaurants are loaded
    addMarkersToMap();
  }
};

// creates marker on the map for every restaurant
function addMarkersToMap() {
  restaurants.forEach(restaurant => {
    const marker = L.marker([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(`<h3>${restaurant.name}</h3><p>${restaurant.address}</p>`);
      markers.set(restaurant._id, marker); // Store marker in the map for highlighting
  });
};

// Starts the location search
// specifies settings for how the browser should retrieve the user's location
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

navigator.geolocation.getCurrentPosition(success, error, options);


async function main() {
  try {
    await getRestaurants(); // Ensure restaurants are loaded
    sortRestaurants();
    createTable();
    cityOption();
    addMarkersToMap(); // Add markers after restaurants are loaded
  } catch (error) {
    console.log(error);
  }
};
  
main();