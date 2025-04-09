import { fetchData } from "./lib/fetchData.js";

const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';
const table = document.getElementById('restaurant-table');
let restaurants = [];
const menuCity = document.getElementById('menu-city');
const searchButton = document.getElementById('search-button');
let map; // Declare map globally
const markers = new Map(); // Store markers with restaurant IDs as keys
const label = document.getElementById('selected-restaurant');

// menu link reference
const openDayMenu = document.getElementById('open-today-menu');
const todayContent = document.getElementById('today-menu-content');
const todayModal = document.getElementById('today-menu');
const closeTodayModal = document.getElementById('close-today-menu');

const openWeekMenu = document.getElementById('open-week-menu');
const weekContent = document.getElementById('week-menu-content');
const weekModal = document.getElementById('week-menu');
const closeWeekModal = document.getElementById('close-week-menu');
// login references
const openLogin = document.getElementById('open-login-modal');
const closeLogin = document.getElementById('close-login');
const loginModal = document.getElementById('login-modal');
// register references
const openRegister = document.getElementById('open-register-modal');
const closeRegister = document.getElementById('close-register');
const registerModal = document.getElementById('register-modal');
//###########################################################

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
closeTodayModal.addEventListener('click', (event) => {
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
    loginModal.close();
    registerModal.showModal(); 
});

// Close the login modal 
closeRegister.addEventListener('click', () => {
    registerModal.close(); 
});

// Event listener for the SEARCH button + updater
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
        });

        createRestaurantCells(restaurant, tr);
        table.appendChild(tr);
    });
});

//########################## html funktiot ##########################################

// creates table and appends all found restaurants
function createRestaurantCells(restaurant, tr) {
  const nameTd = document.createElement('td');
  nameTd.innerText = restaurant.name;
  const cityTd = document.createElement('td');
  cityTd.innerText = restaurant.city;
  tr.append(nameTd, cityTd);
};

// creates html for menu modal (restaurant info)
function createModalHtml(restaurant, modal) {
  const nameH3 = document.createElement('h3');
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
          <h4>${day.date}</h4>
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
  
// gets every restaurant
async function getRestaurants() {
  try {
    restaurants = await fetchData(apiUrl + '/restaurants');
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

// gets restaurants weekly meny
async function getWeeklyMenu(id, lang) {
  try {
    return await fetchData(`${apiUrl}/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
};
 
// sorts restaurants order
function sortRestaurants() {
  restaurants.sort(function (a, b) {
    return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
  });
};

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

function success(pos) {
  const crd = pos.coords;

  // Initialize the Leaflet map centered on the user's location
  map = L.map('map').setView([crd.latitude, crd.longitude], 13);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add a custom marker for the user's location
  const userIcon = L.icon({
    iconUrl: 'http://maps.google.com/mapfiles/ms/micons/blue-pushpin.png', // Path to your custom marker image
    iconSize: [30, 45], // Adjust the size of the marker
    iconAnchor: [15, 45], // Anchor point of the marker
    popupAnchor: [0, -40], // Position of the popup relative to the marker
  });

  L.marker([crd.latitude, crd.longitude], { icon: userIcon })
    .addTo(map)
    .bindPopup(`<b>Your Location</b><br>`)
    .openPopup();

  // Add markers after restaurants are loaded
  if (restaurants.length > 0) {
    addMarkersToMap();
  }
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

function highlightMarker(restaurantId) {
  const marker = markers.get(restaurantId);
  label.textContent = ''; // empties the h4 from #selected-restaurant
  if (marker) {
    // Reset all markers to the default icon
     markers.forEach(m => m.setIcon(defaultIcon));

    // Highlight the clicked marker and open its popup
    marker.setIcon(highlightedIcon).openPopup();

    // Adjust the map view to ensure the marker is fully visible
    map.flyTo(marker.getLatLng(), 15, {
      animate: true,
      duration: 0.5 // Animation duration in seconds
    });
  }   
};

function createTable() {
  for (const restaurant of restaurants) {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
        highlightMarker(restaurant._id); // Call highlightMarker with the restaurant's ID
        console.log(restaurant._id);

        const labelH = document.createElement('h4');
        labelH.innerText = restaurant.name;
        label.append(labelH);
    });

    createRestaurantCells(restaurant, tr);
    table.appendChild(tr);
  }
};

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

function addMarkersToMap() {
  restaurants.forEach(restaurant => {
    const marker = L.marker([restaurant.location.coordinates[1], restaurant.location.coordinates[0]], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(`<h3>${restaurant.name}</h3><p>${restaurant.address}</p>`);

      markers.set(restaurant._id, marker); // Store marker in the map
  });
};

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// Starts the location search
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