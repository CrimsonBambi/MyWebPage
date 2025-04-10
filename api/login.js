
export async function login(username, password) {
    try {
        const response = await fetch('https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Login failed: ${errorData.message || response.statusText}`);
            return null;
          }
      
          const data = await response.json();
          const token = data.token;
      
          console.log('Login successful:', data);
          
          // Save token in localStorage
          localStorage.setItem('token', token);
          alert('Login successful!');

          return token;
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred during login.');
    }
};