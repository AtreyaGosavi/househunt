import React, { useState, useContext } from 'react';
import {
  Container, Box, Typography, TextField, Button, Alert,
  MenuItem, LinearProgress, InputAdornment, IconButton,
  Grid, Paper, Stack
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';

// ──────────── Password Strength Helper ────────────
const getStrength = (pwd) => {
  let score = 0;
  if (!pwd) return { score: 0, label: '', color: '#e0e0e0' };
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[@$!%*?&#^()_+\-=]/.test(pwd)) score++;

  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#e0e0e0', '#EF4444', '#F59E0B', '#FBBF24', '#10B981', '#059669'];
  return { score, label: labels[score], color: colors[score] };
};

const REQUIREMENTS = [
  { test: (p) => p.length >= 8,                   text: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),                 text: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p),                 text: 'One lowercase letter' },
  { test: (p) => /\d/.test(p),                    text: 'One number' },
  { test: (p) => /[@$!%*?&#^()_+\-=]/.test(p),   text: 'One special character' },
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const strength = getStrength(password);
  const allMet = REQUIREMENTS.every(r => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userType) { setError('Please select your account type first.'); return; }
    if (!allMet) { setError('Please meet all password requirements.'); return; }
    try {
      await register({ name, email, phone, password, userType });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #2563EB 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 6,
    }}>
      <Container maxWidth="sm">
        {/* Role Selector Cards */}
        <Typography variant="h4" align="center" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
          Join HouseHunt
        </Typography>
        <Typography align="center" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
          First, tell us who you are
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { type: 'Tenant', icon: <HomeIcon sx={{ fontSize: 40 }} />, title: 'I\'m a Tenant', desc: 'Looking for a place to rent' },
            { type: 'Owner', icon: <ApartmentIcon sx={{ fontSize: 40 }} />, title: 'I\'m an Owner', desc: 'I want to list my property' },
          ].map(({ type, icon, title, desc }) => (
            <Grid item xs={6} key={type}>
              <Paper
                onClick={() => setUserType(type)}
                elevation={0}
                sx={{
                  p: 3, textAlign: 'center', cursor: 'pointer', borderRadius: 3,
                  border: userType === type ? '2px solid #2563EB' : '2px solid rgba(255,255,255,0.15)',
                  background: userType === type ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': { background: 'rgba(37,99,235,0.1)', transform: 'translateY(-2px)' },
                }}
              >
                {icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Form */}
        <Paper
          elevation={0}
          sx={{
            p: 4, borderRadius: 4,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField required fullWidth label="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <TextField required fullWidth label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <TextField required fullWidth label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
              
              {/* Password field with visibility toggle */}
              <TextField
                required fullWidth
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Strength Bar */}
              {password && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Password Strength</Typography>
                    <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600 }}>{strength.label}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(strength.score / 5) * 100}
                    sx={{
                      height: 6, borderRadius: 3,
                      bgcolor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 3, transition: 'all 0.3s ease' }
                    }}
                  />
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                    {REQUIREMENTS.map((r, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{
                          width: 8, height: 8, borderRadius: '50%',
                          bgcolor: r.test(password) ? '#10B981' : '#CBD5E1',
                          transition: 'background 0.2s',
                        }} />
                        <Typography variant="caption" sx={{ color: r.test(password) ? '#10B981' : '#94A3B8', fontSize: 11 }}>
                          {r.text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!allMet}
                sx={{ py: 1.5, mt: 1, fontSize: 16, fontWeight: 700 }}
              >
                Create Account
              </Button>

              <Typography align="center" variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
