import { createContext, useState, useEffect } from 'react';

// Create the Context
export const AuthContext = createContext();

// 💡 Beginner Note: This Provider wraps our whole app so that ANY page can ask "Who is logged in right now?"
// It reads from localStorage first so that if we refresh the page, we stay logged in.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Wait for localStorage check

  // Load user data when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthProvider: Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  // Function to call after successful login/registration
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Function to clear session (Logout)
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {/* We only render the app once we know if there is a logged in user in storage */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
