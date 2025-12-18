// Test script to debug logout endpoint
const testLogout = async () => {
  try {
    // First, login to get a valid token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Versayo.franklin@gmail.com',
        password: 'Teuf2345623_'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.accessToken) {
      console.error('Failed to get access token');
      return;
    }
    
    // Now try to logout
    const logoutResponse = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Logout status:', logoutResponse.status);
    const logoutData = await logoutResponse.text();
    console.log('Logout response:', logoutData);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testLogout();
