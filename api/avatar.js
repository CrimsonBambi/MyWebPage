export async function uploadAvatarFile(fileInput, token) {
  try {
    const formData = new FormData();
    formData.append('avatar', fileInput); 

    const response = await fetch('https://media2.edu.metropolia.fi/restaurant//api/v1/users/avatar', { // Correct the endpoint if necessary
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // Include the token for authentication
      },
      body: formData,// Send the file as FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Avatar upload failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Avatar uploaded successfully:', data);
    return data.avatar;
    
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

export async function getAvatar(token) {
  
}

