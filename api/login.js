export async function login(username, password) {
    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login failed:', errorData.message || response.statusText);
            alert(`Login failed: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Login successful. Success 200:', data);

        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred during login.');
    }
};

export async function getCurrentUserProfile(token) {
  try {
    const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data; // contains user information
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export async function usernameAvailability(username) {
  try {
    const response = await fetch(`https://media2.edu.metropolia.fi/restaurant/api/v1/users/available/${username}`);
    
    if (!response.ok) {
      throw new Error('Invalid input.');
    }
    const data = await response.json();
    return data.available; // extract the boolean

  } catch (error) {
    console.error('Error checking username availibility:', error);
    return null;
  }
};

export async function updateUserData(updates, storedToken) {
  try {
    const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storedToken}` 
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user data.');
    }

    const data = await response.json();
    console.log('User data updated:', data);

    return data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
