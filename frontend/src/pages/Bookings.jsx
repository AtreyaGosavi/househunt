import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Box, Typography, Paper, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody, Chip, Button,
  Tabs, Tab, CircularProgress, Alert, Avatar, Stack
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { Link } from 'react-router-dom';

const API_ORIGIN = 'http://localhost:5000';
const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('/uploads')) return `${API_ORIGIN}${src}`;
  return src;
};

const StatusChip = ({ status }) => {
  const map = { Pending: 'warning', Confirmed: 'success', Cancelled: 'error', Rejected: 'error' };
  return <Chip label={status} color={map[status] || 'default'} size="small" sx={{ fontWeight: 700 }} />;
};

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState(null);

  const userRole = user?.userType || user?.role || 'Tenant';
  const isOwner = userRole === 'Owner';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/user');
        setBookings(data);
      } catch {
        setMsg({ type: 'error', text: 'Could not load bookings.' });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status });
      // Replace the booking with the updated one from server
      setBookings(prev => prev.map(b => b._id === id ? data : b));
      setMsg({ type: 'success', text: `Booking ${status.toLowerCase()}!` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update.' });
    }
  };

  const tabs = [
    { label: 'All', filter: () => true },
    { label: 'Pending', filter: b => b.status === 'Pending' },
    { label: 'Confirmed', filter: b => b.status === 'Confirmed' },
    { label: 'Past', filter: b => ['Cancelled', 'Rejected'].includes(b.status) },
  ];

  const filtered = bookings.filter(tabs[tab].filter);

  return (
    <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh' }}>
      {/* Header Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', py: 5 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.25)' }}>
              <CalendarMonthIcon sx={{ color: '#60A5FA', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>
                {isOwner ? 'Booking Requests' : 'My Bookings'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 0.3 }}>
                {isOwner
                  ? 'Review and manage requests from tenants'
                  : 'Track all your rental applications in one place'}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {msg && <Alert severity={msg.type} sx={{ mb: 3, borderRadius: 2 }}>{msg.text}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : bookings.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: '2px dashed #CBD5E1' }}>
            <HomeIcon sx={{ fontSize: 52, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>No bookings yet</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {isOwner ? 'Bookings on your properties will appear here.' : 'Browse properties and send a booking request.'}
            </Typography>
            {!isOwner && (
              <Button component={Link} to="/properties" variant="contained" sx={{ fontWeight: 700, borderRadius: 3 }}>
                Browse Properties
              </Button>
            )}
          </Paper>
        ) : (
          <>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                {tabs.map(({ label }, i) => (
                  <Tab key={label} label={`${label} (${bookings.filter(tabs[i].filter).length})`} sx={{ fontWeight: 600 }} />
                ))}
              </Tabs>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFF' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    {isOwner
                      ? <TableCell sx={{ fontWeight: 700 }}>Tenant Info</TableCell>
                      : <TableCell sx={{ fontWeight: 700 }}>Rent</TableCell>}
                    <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    {isOwner && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No bookings in this category.
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(b => {
                    const prop = b.property || {};
                    const tenant = b.tenant || {};
                    return (
                      <TableRow key={b._id} sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                        {/* Property */}
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              variant="rounded"
                              src={resolveImg(prop.images?.[0])}
                              sx={{ width: 48, height: 48, borderRadius: 2 }}
                            >
                              <HomeIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {prop.title || 'Unknown Property'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {prop.location}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Tenant Info (owner) / Rent (tenant) */}
                        {isOwner ? (
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{tenant.name || '—'}</Typography>
                            {tenant.email && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <EmailIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">{tenant.email}</Typography>
                              </Stack>
                            )}
                            {tenant.phone && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">{tenant.phone}</Typography>
                              </Stack>
                            )}
                          </TableCell>
                        ) : (
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              ₹{prop.rentAmount?.toLocaleString() || '—'}
                            </Typography>
                          </TableCell>
                        )}

                        {/* Dates */}
                        <TableCell>
                          <Typography variant="body2">
                            {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            to {b.endDate ? new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell><StatusChip status={b.status} /></TableCell>

                        {/* Owner actions */}
                        {isOwner && (
                          <TableCell>
                            {b.status === 'Pending' ? (
                              <Stack direction="row" spacing={1}>
                                <Button size="small" variant="contained" color="success"
                                  sx={{ fontWeight: 700, borderRadius: 2 }}
                                  onClick={() => handleStatus(b._id, 'Confirmed')}>
                                  Accept
                                </Button>
                                <Button size="small" variant="outlined" color="error"
                                  sx={{ fontWeight: 700, borderRadius: 2 }}
                                  onClick={() => handleStatus(b._id, 'Rejected')}>
                                  Reject
                                </Button>
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                Decision final
                              </Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Bookings;
