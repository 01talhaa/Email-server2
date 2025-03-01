const logout = () => {
    if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
    }
    
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
};