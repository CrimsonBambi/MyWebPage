

export async function registerUser(userData) {
    try {
      const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
  
      // Parse the response data
      const data = await response.json();
      console.log('User registered successfully:', userData);
  
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  