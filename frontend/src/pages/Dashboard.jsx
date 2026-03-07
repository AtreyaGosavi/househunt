import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Button, Tabs, Tab, Grid, Alert,
  Card, CardContent, CardMedia, CardActions, CircularProgress, Stack
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const API_ORIGIN = 'http://localhost:5000';
const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('/uploads')) return `${API_ORIGIN}${src}`;
  return src;
};
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const StatusChip = ({ status }) => {
  const colorMap = { Pending: 'warning', Confirmed: 'success', Cancelled: 'error', Rejected: 'error' };
  return <Chip label={status} color={colorMap[status] || 'default'} size="small" sx={{ fontWeight: 600 }} />;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation(); // triggers re-render on EVERY navigation
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tab, setTab] = useState(0);
  const [actionMsg, setActionMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = user?.userType || user?.role || 'Tenant';
  const isOwner = userRole === 'Owner';

  // fetchData is stable across renders
  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      // Always fetch bookings
      const { data: bData } = await api.get('/bookings/user');
      setBookings(bData);

      // Owner: also fetch their properties
      if (isOwner) {
        const { data: pData } = await api.get('/properties');
        const userId = String(user._id);
        const mine = pData.filter(p => {
          const oid = typeof p.owner === 'object'
            ? String(p.owner?._id || p.owner)
            : String(p.owner);
          return oid === userId;
        });
        setProperties(mine);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id, isOwner]);

  // Re-fetch whenever the user navigates TO this page (location.key changes), or user changes
  useEffect(() => {
    fetchData();
  }, [fetchData, location.key]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status });
      // Replace with full server response; also refresh properties if confirmed
      setBookings(prev => prev.map(b => b._id === id ? data : b));
      if (status === 'Confirmed') {
        // Refresh property list to update status badges
        await fetchData();
      }
      setActionMsg({ type: 'success', text: `Booking ${status.toLowerCase()} successfully!` });
      setTimeout(() => setActionMsg(null), 3000);
    } catch (error) {
      setActionMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update booking status.' });
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const activeBookings  = bookings.filter(b => b.status === 'Confirmed');
  const pastBookings    = bookings.filter(b => ['Cancelled', 'Rejected'].includes(b.status));

  const tabData = [
    { label: `All (${bookings.length})`,            data: bookings },
    { label: `Pending (${pendingBookings.length})`,  data: pendingBookings },
    { label: `Active (${activeBookings.length})`,    data: activeBookings },
    { label: `Past (${pastBookings.length})`,        data: pastBookings },
  ];

  if (!user) return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h6" color="text.secondary">Please log in to view your dashboard.</Typography>
      <Button component={Link} to="/login" variant="contained" sx={{ mt: 2, fontWeight: 700, borderRadius: 3 }}>Login</Button>
    </Box>
  );

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>
                {isOwner ? '🏠 Owner Dashboard' : '🔍 My Rentals'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                Welcome back, <strong style={{ color: 'white' }}>{user.name}</strong> · {userRole}
              </Typography>
            </Box>
            {isOwner && (
              <Button
                component={Link} to="/add-property"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ fontWeight: 700, py: 1.5, px: 3, background: 'linear-gradient(135deg,#2563EB,#3B82F6)', borderRadius: 3 }}
              >
                Add New Property
              </Button>
            )}
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            {(isOwner ? [
              { label: 'Properties Listed', value: properties.length, color: '#3B82F6' },
              { label: 'Booking Requests', value: bookings.length, color: '#F59E0B' },
              { label: 'Confirmed', value: activeBookings.length, color: '#10B981' },
              { label: 'Pending Review', value: pendingBookings.length, color: '#F97316' },
            ] : [
              { label: 'Total Bookings', value: bookings.length, color: '#3B82F6' },
              { label: 'Pending', value: pendingBookings.length, color: '#F59E0B' },
              { label: 'Confirmed', value: activeBookings.length, color: '#10B981' },
              { label: 'Past', value: pastBookings.length, color: '#64748B' },
            ]).map(({ label, value, color }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="h4" sx={{ color, fontWeight: 800 }}>{value}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>{label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {actionMsg && <Alert severity={actionMsg.type} sx={{ mb: 3, borderRadius: 2 }}>{actionMsg.text}</Alert>}

        {/* ── OWNER: My Listed Properties ─────────────────────────── */}
        {isOwner && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Listed Properties</Typography>

            {properties.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, borderRadius: 4, textAlign: 'center', border: '2px dashed #CBD5E1' }}>
                <HomeIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>No properties listed yet</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Start by adding your first property.</Typography>
                <Button component={Link} to="/add-property" variant="contained" startIcon={<AddIcon />} sx={{ fontWeight: 700, borderRadius: 3 }}>
                  Add Your First Property
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {properties.map(property => (
                  <Grid item xs={12} sm={6} md={4} key={property._id}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden',
                      transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(15,23,42,0.12)' } }}>
                      <CardMedia
                        component="img" height="160"
                        image={resolveImg(property.images?.[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                        alt={property.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
                            {property.title}
                          </Typography>
                          <Chip label={property.status} size="small"
                            color={property.status === 'Available' ? 'success' : 'error'}
                            sx={{ fontWeight: 700, ml: 1, flexShrink: 0 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, color: '#2563EB' }} />
                          <Typography variant="body2" noWrap>{property.location}</Typography>
                        </Box>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                          ₹{property.rentAmount?.toLocaleString()}<Typography component="span" variant="caption" color="text.secondary"> /mo</Typography>
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                        <Button size="small" component={Link} to={`/properties/${property._id}`}
                          variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, fontSize: 12 }}>
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* ── BOOKING REQUESTS / MY BOOKINGS TABLE ─────────────────── */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {isOwner ? 'Booking Requests' : 'My Booking Requests'}
        </Typography>

        {bookings.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Typography color="text.secondary">
              {isOwner ? 'No booking requests yet. Tenants will appear here once they request your properties.' : 'You haven\'t made any booking requests. Browse properties to get started.'}
            </Typography>
            {!isOwner && (
              <Button component={Link} to="/properties" variant="contained" sx={{ mt: 2, fontWeight: 700, borderRadius: 3 }}>
                Browse Properties
              </Button>
            )}
          </Paper>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .Mui-selected': { fontWeight: 700 } }}>
                {tabData.map(({ label }) => <Tab key={label} label={label} />)}
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
                    <TableCell sx={{ fontWeight: 700 }}>Date Requested</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    {isOwner && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(tabData[tab]?.data || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No bookings in this category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (tabData[tab]?.data || []).map(booking => {
                      const prop   = booking.property || {};
                      const tenant = booking.tenant   || {};
                      return (
                        <TableRow key={booking._id} sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {prop.title || 'Unknown Property'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{prop.location}</Typography>
                          </TableCell>

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

                          <TableCell>
                            <Typography variant="body2">
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </Typography>
                          </TableCell>

                          <TableCell><StatusChip status={booking.status} /></TableCell>

                          {isOwner && (
                            <TableCell>
                              {booking.status === 'Pending' ? (
                                <Stack direction="row" spacing={1}>
                                  <Button size="small" variant="contained" color="success"
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                    onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}>
                                    Accept
                                  </Button>
                                  <Button size="small" variant="outlined" color="error"
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                    onClick={() => handleStatusUpdate(booking._id, 'Rejected')}>
                                    Reject
                                  </Button>
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.disabled">Decision final</Typography>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
