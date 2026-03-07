import React, { useContext, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme, Avatar
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const navLinks = (user) => {
  const isOwner = user?.userType === 'Owner' || user?.role === 'Owner';
  const isAdmin = user?.userType === 'Admin' || user?.role === 'Admin';

  if (!user) {
    // Guest: NO links — must log in first
    return [];
  }
  if (isAdmin) {
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Admin Panel', to: '/admin' },
    ];
  }
  if (isOwner) {
    return [
      { label: 'My Dashboard', to: '/dashboard' },
      { label: 'Booking Requests', to: '/bookings' },
      { label: '+ List Property', to: '/add-property', highlight: true },
    ];
  }
  // Tenant
  return [
    { label: 'Browse Properties', to: '/properties' },
    { label: 'My Bookings', to: '/bookings' },
    { label: 'Dashboard', to: '/dashboard' },
  ];
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const links = navLinks(user);
  const isActive = (to) => location.pathname === to;
  const displayRole = user?.userType || user?.role;

  return (
    <AppBar position="static" elevation={0} sx={{
      background: 'rgba(15,23,42,0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Full-width toolbar — NO Container gap */}
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 0.5 }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 4 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg, #2563EB, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5,
          }}>
            <HomeIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>
            House<span style={{ color: '#3B82F6' }}>Hunt</span>
          </Typography>
        </Box>

        {/* Desktop Nav */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
            {links.map(({ label, to, highlight }) => (
              <Button
                key={to}
                component={Link}
                to={to}
                sx={{
                  color: isActive(to) ? '#3B82F6' : 'rgba(255,255,255,0.75)',
                  fontWeight: isActive(to) ? 700 : 500,
                  fontSize: 14,
                  borderRadius: 2,
                  px: 2,
                  ...(highlight && {
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    color: 'white',
                    '&:hover': { background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }
                  }),
                  ...(!highlight && {
                    '&:hover': { color: 'white', background: 'rgba(255,255,255,0.08)' },
                  }),
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

        {/* Auth Actions */}
        {!isMobile && (
          user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563EB', fontSize: 14, fontWeight: 700 }}>
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', lineHeight: 1 }}>
                    {displayRole}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={handleLogout}
                variant="outlined"
                size="small"
                sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'white', color: 'white' } }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button component={Link} to="/login" sx={{ color: 'rgba(255,255,255,0.8)' }}>Log In</Button>
              <Button component={Link} to="/register" variant="contained" sx={{ fontWeight: 700 }}>Get Started</Button>
            </Box>
          )
        )}

        {/* Mobile Hamburger */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, background: '#0F172A', color: 'white' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>HouseHunt</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <List>
          {links.map(({ label, to }) => (
            <ListItem key={to} component={Link} to={to} onClick={() => setDrawerOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { background: 'rgba(255,255,255,0.07)' } }}
            >
              <ListItemText primary={label} />
            </ListItem>
          ))}
          {user ? (
            <ListItem onClick={handleLogout} sx={{ cursor: 'pointer', color: '#EF4444' }}>
              <ListItemText primary="Logout" />
            </ListItem>
          ) : (
            <>
              <ListItem component={Link} to="/login" onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <ListItemText primary="Log In" />
              </ListItem>
              <ListItem component={Link} to="/register" onClick={() => setDrawerOpen(false)} sx={{ color: '#3B82F6' }}>
                <ListItemText primary="Get Started" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
