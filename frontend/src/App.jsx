import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Import Pages (will be created soon)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PropertyListings from './pages/PropertyListings';
import PropertyDetail from './pages/PropertyDetail';
import AddProperty from './pages/AddProperty';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Bookings from './pages/Bookings';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  if (!user) return <Navigate to="/login" replace />;

  // Support both old `userType` and new canonical `role` field
  const userRole = user.userType || user.role;
  if (roles && !roles.includes(userRole)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/properties" element={<PropertyListings />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Owner Routes */}
            <Route path="/add-property" element={<PrivateRoute roles={['Owner', 'Admin']}><AddProperty /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminPanel /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
