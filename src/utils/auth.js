export const getAuthToken = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('Authentication required');
    }

    const parsedUser = JSON.parse(userData);
    const token = parsedUser.token || parsedUser.access_token;

    if (!token) {
      throw new Error('Invalid authentication token');
    }

    return token;
  } catch (error) {
    console.error('Token error:', error);
    throw new Error('Authentication required');
  }
};